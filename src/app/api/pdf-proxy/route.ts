import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the URL from the query parameter
    const url = request.nextUrl.searchParams.get("url");
    const download = request.nextUrl.searchParams.get("download") === "true";

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    console.log("Proxying PDF request for:", url, "download mode:", download);

    // Fix Cloudinary URL if it's a PDF with incorrect path
    let fetchUrl = url;
    if (
      fetchUrl.includes("cloudinary.com") &&
      fetchUrl.includes("/image/upload/") &&
      (fetchUrl.toLowerCase().endsWith(".pdf") || fetchUrl.includes(".pdf"))
    ) {
      // Replace image/upload with raw/upload for PDFs
      fetchUrl = fetchUrl.replace("/image/upload/", "/raw/upload/");
      console.log("Modified Cloudinary URL for PDF:", fetchUrl);
    }

    // Fetch the PDF from the provided URL
    const response = await fetch(fetchUrl, {
      headers: {
        Accept: "application/pdf, application/octet-stream, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: "https://res.cloudinary.com/",
        Origin: "https://res.cloudinary.com",
      },
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch PDF:",
        response.status,
        response.statusText,
        "URL:",
        fetchUrl,
        "Original URL:",
        url
      );

      // If it's a Cloudinary 401, give more specific info
      if (response.status === 401 && fetchUrl.includes("cloudinary.com")) {
        return NextResponse.json(
          {
            error: `Cloudinary authorization failed (401). This might be due to restricted access or a private resource. 
            Try downloading directly or accessing through another method.`,
            url: fetchUrl,
          },
          { status: response.status }
        );
      }

      return NextResponse.json(
        {
          error: `Failed to fetch PDF: ${response.status} ${response.statusText}`,
          url: fetchUrl,
        },
        { status: response.status }
      );
    }

    // Get the PDF data as an array buffer
    const pdfData = await response.arrayBuffer();

    // Get the content type or default to application/pdf
    let contentType = response.headers.get("Content-Type") || "application/pdf";

    // Clean up content type if needed
    if (!contentType.includes("pdf") && !contentType.includes("octet-stream")) {
      contentType = "application/pdf";
    }

    // Get content disposition or create one based on download parameter
    let contentDisposition = response.headers.get("Content-Disposition");
    if (!contentDisposition) {
      contentDisposition = download ? "attachment" : "inline";
    } else if (download && !contentDisposition.includes("attachment")) {
      contentDisposition = contentDisposition.replace("inline", "attachment");
    }

    // Extract filename from Content-Disposition if available
    let filename = "";
    const filenameMatch = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, "");
    }

    // If no filename found, try to get one from the URL
    if (!filename) {
      const urlParts = url.split("/");
      filename = urlParts[urlParts.length - 1];
      // Add PDF extension if missing
      if (!filename.toLowerCase().endsWith(".pdf")) {
        filename += ".pdf";
      }
      // Update content disposition with the filename
      contentDisposition = `${
        download ? "attachment" : "inline"
      }; filename="${filename}"`;
    }

    console.log("Serving PDF with:", {
      contentType,
      contentDisposition,
      size: pdfData.byteLength,
    });

    // Return the PDF with appropriate headers
    return new NextResponse(pdfData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
        "Content-Length": pdfData.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("PDF proxy error:", error);
    return NextResponse.json(
      {
        error: "Error fetching PDF",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
