"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
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
import { User } from "@/models/user.model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  Upload,
} from "lucide-react";
import { Section } from "@/models/section.model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface BatchUser {
  user: User[];
  status: "pending" | "approved" | "rejected";
  _id: string;
}

// Update interface to match the Note model structure from MongoDB
interface NoteContent {
  _id: string;
  title: string;
  description?: string;
  url: string; // In MongoDB it's url but we'll access it as fileUrl in the component
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

// Remove other type definitions since we'll use 'any' for simplicity
// in the content mapping to avoid TypeScript errors

export default function TeacherBatchPage({
  params,
}: {
  params: { name: string };
}) {
  const router = useRouter();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionName, setSectionName] = useState("");
  const [creating, setCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for rename functionality
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  // State for delete functionality
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // State for add note functionality
  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  // Add these new state variables
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [deletingNote, setDeletingNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteContent | null>(null);

  // Add state for lecture functionality
  const [isLectureDialogOpen, setIsLectureDialogOpen] = useState(false);
  const [addLectureDialogOpen, setAddLectureDialogOpen] = useState(false);
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDescription, setLectureDescription] = useState("");
  const [lectureUrl, setLectureUrl] = useState("");
  const [addingLecture, setAddingLecture] = useState(false);
  const [deleteLectureDialogOpen, setDeleteLectureDialogOpen] = useState(false);
  const [deletingLecture, setDeletingLecture] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<LectureContent | null>(
    null
  );

  const fetchBatch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/batches/getone?name=${params.name}`);
      const batchData = {
        ...res.data.data,
        users: Array.isArray(res.data.data.users) ? res.data.data.users : [],
      };
      setBatch(batchData);
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

  const createSection = async () => {
    if (!sectionName.trim() || !batch) return;

    try {
      setCreating(true);
      // Use type assertion to access the _id field from MongoDB
      const res = await axios.post("/api/sections/create", {
        name: sectionName.trim(),
        batchId: (batch as any)._id,
        dataType: activeTab === "notes" ? "notes" : "lectures",
      });

      if (res.data.success || res.status === 201) {
        toast.success("Section created successfully");
        await fetchBatch();
        setSectionName("");
        setIsDialogOpen(false);
        setIsLectureDialogOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create section");
    } finally {
      setCreating(false);
    }
  };

  const handleRenameSection = async () => {
    if (!newSectionName.trim() || !selectedSection) return;

    try {
      setRenaming(true);
      const res = await axios.patch("/api/sections/rename", {
        sectionId: (selectedSection as any)._id,
        newName: newSectionName.trim(),
      });

      if (res.status === 200) {
        toast.success("Section renamed successfully");
        await fetchBatch();
        setActiveTab("notes");
        setNewSectionName("");
        setRenameDialogOpen(false);
        setSelectedSection(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to rename section");
    } finally {
      setRenaming(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!selectedSection) return;

    try {
      setDeleting(true);
      const res = await axios.delete("/api/sections/delete", {
        data: { sectionId: (selectedSection as any)._id },
      });

      if (res.status === 200) {
        toast.success("Section deleted successfully");
        await fetchBatch();
        setActiveTab("notes");
        setDeleteDialogOpen(false);
        setSelectedSection(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete section");
    } finally {
      setDeleting(false);
    }
  };

  const openRenameDialog = (section: Section) => {
    setActiveTab("notes");
    setSelectedSection(section);
    setNewSectionName(section.name);
    setRenameDialogOpen(true);
  };

  const openDeleteDialog = (section: Section) => {
    setActiveTab("notes");
    setSelectedSection(section);
    setDeleteDialogOpen(true);
  };

  const openAddNoteDialog = (section: Section) => {
    setActiveTab("notes");
    setSelectedSection(section);
    setNoteTitle("");
    setNoteDescription("");
    setSelectedFile(null);
    setFileError("");
    setAddNoteDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log(
      "File selection:",
      files && files.length > 0 ? files[0].name : "No file selected"
    );

    if (files && files.length > 0) {
      const file = files[0];
      // Validate file type
      if (file.type !== "application/pdf") {
        console.log("File rejected: Not a PDF file. Type:", file.type);
        setFileError("Only PDF files are allowed");
        setSelectedFile(null);
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        console.log("File rejected: Too large. Size:", file.size);
        setFileError("File size should be less than 5MB");
        setSelectedFile(null);
        return;
      }

      console.log("File accepted:", file.name);
      setSelectedFile(file);
      setFileError("");
    }
  };

  const handleAddNote = async () => {
    console.log(
      "Submit attempt - Title:",
      noteTitle,
      "File:",
      selectedFile ? selectedFile.name : "None"
    );

    if (!noteTitle.trim() || !selectedSection || !selectedFile) {
      console.log("Validation failed:", {
        titleValid: Boolean(noteTitle.trim()),
        sectionValid: Boolean(selectedSection),
        fileValid: Boolean(selectedFile),
      });
      setFileError(selectedFile ? "" : "Please select a file");
      return;
    }

    try {
      setUploading(true);
      console.log("Starting upload to server...");

      // Create form data for file upload
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Upload via our server-side API endpoint (secure method)
      console.log("Sending request to server-side API...");

      // Set a longer timeout for large files
      const uploadRes = await axios.post("/api/upload", formData, {
        timeout: 60000, // 60 seconds timeout for upload
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response received:", {
        status: uploadRes.status,
        statusText: uploadRes.statusText,
        hasData: !!uploadRes.data,
        dataKeys: uploadRes.data ? Object.keys(uploadRes.data) : [],
        fullData: JSON.stringify(uploadRes.data),
      });

      // Check for url in various possible formats
      const fileUrl =
        uploadRes.data?.secure_url ||
        uploadRes.data?.url ||
        uploadRes.data?.result?.secure_url;
      console.log("Extracted file URL:", fileUrl);

      if (fileUrl) {
        // Save note data to MongoDB
        const noteData = {
          title: noteTitle.trim(),
          description: noteDescription.trim() || undefined,
          url: fileUrl,
          sectionId: (selectedSection as any)._id,
        };

        console.log("Saving to MongoDB:", noteData);
        const saveRes = await axios.post("/api/note/create", noteData);
        console.log("MongoDB response:", saveRes.data);

        if (saveRes.status === 201) {
          toast.success("Note added successfully");
          await fetchBatch();
          setAddNoteDialogOpen(false);
          // Toggle the section to expanded state to show the new note
          setExpandedSections({
            ...expandedSections,
            [(selectedSection as any)._id]: true,
          });
          // Reset all form fields after successful upload
          setNoteTitle("");
          setNoteDescription("");
          setSelectedFile(null);
          setFileError("");
        }
      } else {
        console.error(
          "Missing file URL in response. Full response:",
          uploadRes.data
        );
        toast.error(
          "Failed to get file URL from upload service. Check console for details."
        );
      }
    } catch (error: any) {
      console.error("Error adding note:", error);

      let errorMessage = "Failed to add note";

      if (error.response) {
        console.error("Error response data:", error.response.data);
        errorMessage =
          error.response.data?.details ||
          error.response.data?.error ||
          error.response.data?.message ||
          "Server error during upload";
      } else if (error.request) {
        console.error("Error request:", error.request);
        errorMessage =
          "No response from server. Check your network connection.";
      } else {
        console.error("Error message:", error.message);
        errorMessage = error.message || "Unknown error occurred";
      }

      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Add this new function to handle note deletion
  const handleDeleteNote = async () => {
    if (!selectedNote) return;

    try {
      setDeletingNote(true);
      const res = await axios.delete("/api/notes/delete", {
        data: { noteId: selectedNote._id },
      });

      if (res.status === 200) {
        toast.success("Note deleted successfully");
        await fetchBatch();
        setDeleteNoteDialogOpen(false);
        setSelectedNote(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete note");
    } finally {
      setDeletingNote(false);
    }
  };

  const openAddLectureDialog = (section: Section) => {
    setActiveTab("lectures");
    setSelectedSection(section);
    setLectureTitle("");
    setLectureDescription("");
    setLectureUrl("");
    setAddLectureDialogOpen(true);
  };

  const handleAddLecture = async () => {
    if (!lectureTitle.trim() || !selectedSection || !lectureUrl.trim()) {
      return;
    }

    try {
      setAddingLecture(true);

      // Save lecture data to MongoDB
      const lectureData = {
        title: lectureTitle.trim(),
        description: lectureDescription.trim() || undefined,
        url: lectureUrl.trim(),
        sectionId: (selectedSection as any)._id,
      };

      const saveRes = await axios.post("/api/videos/create", lectureData);

      if (saveRes.status === 201) {
        toast.success("Lecture added successfully");
        await fetchBatch();
        // Reset form fields
        setLectureTitle("");
        setLectureDescription("");
        setLectureUrl("");
        setAddLectureDialogOpen(false);
        // Toggle the section to expanded state to show the new lecture
        setExpandedSections({
          ...expandedSections,
          [(selectedSection as any)._id]: true,
        });
      }
    } catch (error: any) {
      console.error("Error adding lecture:", error);
      toast.error(error.response?.data?.message || "Failed to add lecture");
    } finally {
      setAddingLecture(false);
    }
  };

  const handleDeleteLecture = async () => {
    if (!selectedLecture) return;

    try {
      setDeletingLecture(true);
      const res = await axios.delete("/api/videos/delete", {
        data: { videoId: selectedLecture._id },
      });

      if (res.status === 200) {
        toast.success("Lecture deleted successfully");
        await fetchBatch();
        setDeleteLectureDialogOpen(false);
        setSelectedLecture(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete lecture");
    } finally {
      setDeletingLecture(false);
    }
  };

  // Add cleanup function for dialog closures
  const resetNotesForm = () => {
    setNoteTitle("");
    setNoteDescription("");
    setSelectedFile(null);
    setFileError("");
  };

  const resetLecturesForm = () => {
    setLectureTitle("");
    setLectureDescription("");
    setLectureUrl("");
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
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="lectures">Lectures</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(batch.users) &&
                    (batch.users as any[])
                      .filter(
                        (user) =>
                          user.status === "approved" &&
                          Array.isArray(user.user) &&
                          user.user[0]?.role === "student"
                      )
                      .map((userData, index) => (
                        <TableRow key={index} className="h-12">
                          <TableCell className="py-2">
                            {userData.user[0]?.name}
                          </TableCell>
                          <TableCell className="py-2">
                            {userData.user[0]?.email}
                          </TableCell>
                        </TableRow>
                      ))}
                  {Array.isArray(batch.users) &&
                    (batch.users as any[]).filter(
                      (user) =>
                        user.status === "approved" &&
                        Array.isArray(user.user) &&
                        user.user[0]?.role === "student"
                    ).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center text-muted-foreground py-2"
                        >
                          No active students in this batch
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Study Materials</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Create Section</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Section</DialogTitle>
                    <DialogDescription>
                      Enter a name for your new section to organize study
                      materials.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="section-name">Section Name</Label>
                      <Input
                        id="section-name"
                        placeholder="Enter section name"
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createSection}
                      disabled={!sectionName.trim() || creating}
                    >
                      {creating ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => openAddNoteDialog(note)}
                              >
                                <Upload className="h-4 w-4" />
                                <span>Add Note</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => openRenameDialog(note)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span>Rename</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => openDeleteDialog(note)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                                                  console.log(
                                                    "Fixed Cloudinary PDF URL for download:",
                                                    fileUrl
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
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                              onClick={() => {
                                                setSelectedNote(file);
                                                setDeleteNoteDialogOpen(true);
                                              }}
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lecture Videos</CardTitle>
              <Dialog
                open={isLectureDialogOpen}
                onOpenChange={setIsLectureDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Create Section</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Section</DialogTitle>
                    <DialogDescription>
                      Enter a name for your new section to organize lecture
                      videos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="lecture-section-name">Section Name</Label>
                      <Input
                        id="lecture-section-name"
                        placeholder="Enter section name"
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsLectureDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createSection}
                      disabled={!sectionName.trim() || creating}
                    >
                      {creating ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => openAddLectureDialog(lecture)}
                              >
                                <Upload className="h-4 w-4" />
                                <span>Add Lecture</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => openRenameDialog(lecture)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span>Rename</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => openDeleteDialog(lecture)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                              onClick={() => {
                                                setSelectedLecture(video);
                                                setDeleteLectureDialogOpen(
                                                  true
                                                );
                                              }}
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
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
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Mark and view attendance records here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rename Section Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Section</DialogTitle>
            <DialogDescription>
              Enter a new name for this section.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-section-name">Section Name</Label>
              <Input
                id="new-section-name"
                placeholder="Enter new section name"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameSection}
              disabled={!newSectionName.trim() || renaming}
            >
              {renaming ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Section Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSection}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog
        open={addNoteDialogOpen}
        onOpenChange={(open) => {
          setAddNoteDialogOpen(open);
          if (!open) resetNotesForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Note</DialogTitle>
            <DialogDescription>
              Upload a PDF file to this section.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="note-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="note-title"
                placeholder="Enter note title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              {!noteTitle.trim() && (
                <p className="text-sm text-destructive mt-1">
                  Title is required
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-description">Description (Optional)</Label>
              <Textarea
                id="note-description"
                placeholder="Enter description"
                value={noteDescription}
                onChange={(e) => setNoteDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-upload">
                PDF File <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  {selectedFile ? selectedFile.name : "Select PDF File"}
                </Button>
              </div>
              {fileError && (
                <p className="text-sm text-destructive mt-1">{fileError}</p>
              )}
              {!selectedFile && !fileError && (
                <p className="text-sm text-destructive mt-1">
                  PDF file is required
                </p>
              )}
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setAddNoteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={!noteTitle.trim() || !selectedFile || uploading}
              className="w-full sm:w-auto"
            >
              {uploading ? "Uploading..." : "Upload Note"}
            </Button>
          </DialogFooter>
          {uploading && (
            <div className="mt-2 text-center text-sm text-muted-foreground">
              Uploading... This may take a moment. Please don't close this
              dialog.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Note Dialog */}
      <Dialog
        open={deleteNoteDialogOpen}
        onOpenChange={setDeleteNoteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedNote?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteNoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNote}
              disabled={deletingNote}
            >
              {deletingNote ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lecture Dialog */}
      <Dialog
        open={addLectureDialogOpen}
        onOpenChange={(open) => {
          setAddLectureDialogOpen(open);
          if (!open) resetLecturesForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lecture</DialogTitle>
            <DialogDescription>
              Enter details for the lecture video.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="lecture-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lecture-title"
                placeholder="Enter lecture title"
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
              />
              {!lectureTitle.trim() && (
                <p className="text-sm text-destructive mt-1">
                  Title is required
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lecture-description">
                Description (Optional)
              </Label>
              <Textarea
                id="lecture-description"
                placeholder="Enter description"
                value={lectureDescription}
                onChange={(e) => setLectureDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lecture-url">
                Video URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lecture-url"
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                value={lectureUrl}
                onChange={(e) => setLectureUrl(e.target.value)}
              />
              {!lectureUrl.trim() && (
                <p className="text-sm text-destructive mt-1">
                  Video URL is required
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setAddLectureDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLecture}
              disabled={
                !lectureTitle.trim() || !lectureUrl.trim() || addingLecture
              }
              className="w-full sm:w-auto"
            >
              {addingLecture ? "Adding..." : "Add Lecture"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Lecture Dialog */}
      <Dialog
        open={deleteLectureDialogOpen}
        onOpenChange={setDeleteLectureDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lecture</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedLecture?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteLectureDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLecture}
              disabled={deletingLecture}
            >
              {deletingLecture ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
