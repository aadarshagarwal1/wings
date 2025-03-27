"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Batch } from "@/models/batch.model";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Section } from "@/models/section.model";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Update interface to match the Note model structure from MongoDB
interface NoteContent {
  _id: string;
  title: string;
  description?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

// Add interface for Lecture content
interface LectureContent {
  _id: string;
  title: string;
  description?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export default function StudentBatchPage({
  params,
}: {
  params: { name: string };
}) {
  const router = useRouter();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("notes");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const fetchBatch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/batches/getone?name=${params.name}`);
      setBatch(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error fetching batch");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.name) {
      fetchBatch();
    }
  }, [params.name]);

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="h-10 bg-muted rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-40 bg-muted rounded"></div>
            <div className="h-40 bg-muted rounded"></div>
            <div className="h-40 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Batch: {params.name}</h1>

      <Tabs 
        defaultValue="notes" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="lectures">Lectures</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Study Materials</CardTitle>
            </CardHeader>
            <CardContent>
              {batch.notes && batch.notes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                  {batch.notes
                    .filter((note: Section) => note.type === "notes")
                    .map((note: Section, index: number) => (
                      <Collapsible
                        key={index}
                        open={expandedSections[(note as any)._id]}
                        onOpenChange={() =>
                          toggleSectionExpanded((note as any)._id)
                        }
                        className="border rounded-lg"
                      >
                        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                          <div className="flex items-center gap-3">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-8 w-8"
                              >
                                {expandedSections[(note as any)._id] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <CardTitle className="text-base">
                              {note.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {note.content && note.content.length
                                ? `${note.content.length} files`
                                : "No files"}
                            </p>
                          </div>
                        </div>

                        <CollapsibleContent>
                          <div className="p-4 space-y-3">
                            {note.content && note.content.length > 0 ? (
                              <div className="grid gap-1.5 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                                {note.content.map(
                                  (file: any, fileIndex: number) => (
                                    <Card
                                      key={fileIndex}
                                      className="flex flex-col"
                                    >
                                      <div className="px-2.5 py-[1px]">
                                        <div className="flex items-center justify-between gap-1">
                                          <div className="truncate">
                                            <p className="text-sm font-medium truncate leading-tight">
                                              {file.title}
                                            </p>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                              <FileText className="h-3 w-3 mr-1" />
                                              <span>
                                                {format(
                                                  new Date(file.createdAt),
                                                  "MMM dd, yyyy"
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex gap-0.5 ml-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0"
                                              onClick={() => {
                                                let fileUrl =
                                                  file.url || file.fileUrl;
                                                if (
                                                  fileUrl.includes(
                                                    "cloudinary.com"
                                                  ) &&
                                                  fileUrl.includes(
                                                    "/image/upload/"
                                                  ) &&
                                                  fileUrl
                                                    .toLowerCase()
                                                    .endsWith(".pdf")
                                                ) {
                                                  fileUrl = fileUrl.replace(
                                                    "/image/upload/",
                                                    "/raw/upload/"
                                                  );
                                                }
                                                window.open(fileUrl, "_blank");
                                              }}
                                            >
                                              <ExternalLink className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0"
                                              onClick={() => {
                                                // Get the correct URL based on what's available
                                                let fileUrl =
                                                  file.url || file.fileUrl;

                                                // Fix Cloudinary URL if needed (for PDFs)
                                                if (
                                                  fileUrl.includes(
                                                    "cloudinary.com"
                                                  ) &&
                                                  fileUrl.includes(
                                                    "/image/upload/"
                                                  ) &&
                                                  fileUrl
                                                    .toLowerCase()
                                                    .endsWith(".pdf")
                                                ) {
                                                  // Replace image/upload with raw/upload for PDFs
                                                  fileUrl = fileUrl.replace(
                                                    "/image/upload/",
                                                    "/raw/upload/"
                                                  );
                                                }

                                                // Show loading message
                                                const toastId = toast.loading(
                                                  "Preparing download..."
                                                );

                                                // Try direct download using fetch
                                                fetch(fileUrl)
                                                  .then((response) => {
                                                    if (!response.ok) {
                                                      throw new Error(
                                                        `HTTP error! Status: ${response.status}`
                                                      );
                                                    }
                                                    return response.blob();
                                                  })
                                                  .then((blob) => {
                                                    // Create a blob URL for the PDF
                                                    const blobUrl =
                                                      URL.createObjectURL(blob);

                                                    // Create a temporary anchor element for download
                                                    const a =
                                                      document.createElement(
                                                        "a"
                                                      );
                                                    a.href = blobUrl;
                                                    a.download =
                                                      file.title ||
                                                      "document.pdf";
                                                    document.body.appendChild(
                                                      a
                                                    );
                                                    a.click();

                                                    // Clean up
                                                    document.body.removeChild(
                                                      a
                                                    );
                                                    URL.revokeObjectURL(
                                                      blobUrl
                                                    );

                                                    // Show success message
                                                    toast.success(
                                                      "Download started",
                                                      { id: toastId }
                                                    );
                                                  })
                                                  .catch((error) => {
                                                    console.error(
                                                      "Download failed:",
                                                      error
                                                    );
                                                    toast.error(
                                                      "Download failed. Try again or save directly from viewer.",
                                                      { id: toastId }
                                                    );
                                                  });
                                              }}
                                            >
                                              <FileText className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </Card>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-center text-muted-foreground">
                                No notes available in this section
                              </p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No study materials available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lectures">
          <Card>
            <CardHeader>
              <CardTitle>Lecture Videos</CardTitle>
            </CardHeader>
            <CardContent>
              {batch.lectures && batch.lectures.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                  {batch.lectures
                    .filter((lecture: Section) => lecture.type === "lectures")
                    .map((lecture: Section, index: number) => (
                      <Collapsible
                        key={index}
                        open={expandedSections[(lecture as any)._id]}
                        onOpenChange={() =>
                          toggleSectionExpanded((lecture as any)._id)
                        }
                        className="border rounded-lg"
                      >
                        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                          <div className="flex items-center gap-3">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-8 w-8"
                              >
                                {expandedSections[(lecture as any)._id] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <CardTitle className="text-base">
                              {lecture.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {lecture.content && lecture.content.length
                                ? `${lecture.content.length} videos`
                                : "No videos"}
                            </p>
                          </div>
                        </div>

                        <CollapsibleContent>
                          <div className="p-4 space-y-3">
                            {lecture.content && lecture.content.length > 0 ? (
                              <div className="grid gap-1.5 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                                {lecture.content.map(
                                  (video: any, videoIndex: number) => (
                                    <Card
                                      key={videoIndex}
                                      className="flex flex-col"
                                    >
                                      <div className="px-2.5 py-[1px]">
                                        <div className="flex items-center justify-between gap-1">
                                          <div className="truncate">
                                            <p className="text-sm font-medium truncate leading-tight">
                                              {video.title}
                                            </p>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                              <FileText className="h-3 w-3 mr-1" />
                                              <span>
                                                {format(
                                                  new Date(video.createdAt),
                                                  "MMM dd, yyyy"
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex gap-0.5 ml-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0"
                                              onClick={() => {
                                                window.open(
                                                  video.url,
                                                  "_blank"
                                                );
                                              }}
                                            >
                                              <ExternalLink className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </Card>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-center text-muted-foreground">
                                No lectures available in this section
                              </p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No lecture videos available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>My Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View your attendance records here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
