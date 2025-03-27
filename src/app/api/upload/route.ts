import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary is configured
function isCloudinaryConfigured() {
  return (
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET
  );
}

export async function POST(request: NextRequest) {
  try {
    // Check Cloudinary configuration
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Cloudinary configuration is missing" },
        { status: 500 }
      );
    }

    // Log environment variables (without secrets)
    console.log("Cloudinary Configuration:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key_exists: !!process.env.CLOUDINARY_API_KEY,
      api_secret_exists: !!process.env.CLOUDINARY_API_SECRET,
    });

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;
    const fileName = file.name;

    console.log("Uploading file:", fileName, "Type:", fileType);

    // Create a promise for the upload
    const uploadPromise = new Promise((resolve, reject) => {
      // Use different options based on file type
      const uploadOptions = {
        folder: "wings_notes",
        // For PDFs, explicitly use 'raw' resource type
        resource_type:
          fileType === "application/pdf"
            ? ("raw" as "raw")
            : ("auto" as "auto"),
        public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, "")}`,
        // Use these settings for better PDF handling
        ...(fileType === "application/pdf"
          ? {
              format: "pdf",
              type: "upload",
              flags: "attachment",
            }
          : {}),
      };

      console.log("Using upload options:", {
        ...uploadOptions,
        fileName,
        fileType,
      });

      // Use buffer upload
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else if (result) {
            console.log(
              "Upload successful - full result:",
              JSON.stringify(result, null, 2)
            );
            let secureUrl = result.secure_url;

            // For PDFs, ensure the URL has the correct extension
            if (fileType === "application/pdf" && !secureUrl.endsWith(".pdf")) {
              secureUrl = `${secureUrl}.pdf`;
            }

            // For PDFs with image/upload in the URL, fix it to use raw/upload
            if (
              fileType === "application/pdf" &&
              secureUrl.includes("/image/upload/")
            ) {
              secureUrl = secureUrl.replace("/image/upload/", "/raw/upload/");
              console.log("Fixed Cloudinary URL from image to raw:", secureUrl);
            }

            // Log the final URL for debugging
            console.log("Final URL being returned:", secureUrl);

            resolve({
              url: secureUrl,
              secure_url: secureUrl,
              public_id: result.public_id,
              asset_id: result.asset_id,
              format: result.format,
              original_filename: fileName,
            });
          } else {
            reject(new Error("Upload result is undefined"));
          }
        })
        .end(buffer);
    });

    // Wait for the upload to complete
    const uploadResult = await uploadPromise;
    console.log(
      "Final result being sent to client:",
      JSON.stringify(uploadResult, null, 2)
    );

    // Return the URL of the uploaded file
    return NextResponse.json(uploadResult);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
