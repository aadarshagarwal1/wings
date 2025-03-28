"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { Batch } from "@/models/batch.model";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Copy,
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  Upload,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context";
import { User } from "@/models/user.model";
import { Request } from "@/models/request.model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Section } from "@/models/section.model";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { AttendanceStatus } from "@/models/attendance.model";

interface ExtendedRequest extends Request {
  _id: string;
}

interface BatchUser {
  user: User[];
  status: "pending" | "approved" | "rejected";
  _id: string;
}

// Interface for Attendance Record
interface AttendanceRecord {
  _id: string;
  batchId: string;
  subject: string;
  period: number;
  record: {
    student: string;
    status: AttendanceStatus;
    _id: string;
  }[];
  createdAt: string;
  updatedAt: string;
  createdById: string;
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

// Interface for Notice Content
interface NoticeContent {
  _id: string;
  title: string;
  description?: string;
  url?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
  batchId?: string;
  createdBy?: string;
}

export default function AdminBatchPage({
  params,
}: {
  params: { name: string };
}) {
  const router = useRouter();
  const { batch, setBatch, user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [activeTab, setActiveTab] = useState("students");
  const [sectionName, setSectionName] = useState("");
  const [creating, setCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLectureDialogOpen, setIsLectureDialogOpen] = useState(false);
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

  // Add these state variables for attendance
  const [createAttendanceDialogOpen, setCreateAttendanceDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [period, setPeriod] = useState<number | string>("");
  const [studentAttendance, setStudentAttendance] = useState<{ 
    studentId: string;
    name: string;
    status: AttendanceStatus;
  }[]>([]);
  const [creatingAttendance, setCreatingAttendance] = useState(false);
  // Add state for attendance details dialog
  const [attendanceDetailsDialogOpen, setAttendanceDetailsDialogOpen] = useState(false);
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState<any>(null);

  // Add these new state variables for attendance
  const [deleteAttendanceDialogOpen, setDeleteAttendanceDialogOpen] = useState(false);
  const [deletingAttendance, setDeletingAttendance] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null);

  // State for notices functionality
  const [addNoticeDialogOpen, setAddNoticeDialogOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDescription, setNoticeDescription] = useState("");
  const [noticeFile, setNoticeFile] = useState<File | null>(null);
  const [noticeFileError, setNoticeFileError] = useState("");
  const [creatingNotice, setCreatingNotice] = useState(false);
  const noticeFileInputRef = useRef<HTMLInputElement>(null);
  const [deleteNoticeDialogOpen, setDeleteNoticeDialogOpen] = useState(false);
  const [deletingNotice, setDeletingNotice] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<NoticeContent | null>(null);

  const handleDeleteAttendance = async () => {
    if (!selectedAttendanceRecord) return;

    try {
      setDeletingAttendance(true);
      const res = await axios.delete("/api/attendance/delete", {
        data: { attendanceId: selectedAttendanceRecord._id },
      });

      if (res.status === 200) {
        toast.success("Attendance record deleted successfully");
        await fetchBatch();
        setDeleteAttendanceDialogOpen(false);
        setSelectedAttendanceRecord(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete attendance record");
    } finally {
      setDeletingAttendance(false);
    }
  };

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
      console.log(error);
      toast.error(error.response?.data?.message || "Error fetching batch");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Section management functions
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
        setDeleteDialogOpen(false);
        setSelectedSection(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete section");
    } finally {
      setDeleting(false);
    }
  };

  // Notes functions
  const openRenameDialog = (section: Section) => {
    setSelectedSection(section);
    setNewSectionName(section.name);
    setRenameDialogOpen(true);
  };

  const openDeleteDialog = (section: Section) => {
    setSelectedSection(section);
    setDeleteDialogOpen(true);
  };

  const openAddNoteDialog = (section: Section) => {
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
    if (!noteTitle.trim() || !selectedSection || !selectedFile) {
      setFileError(selectedFile ? "" : "Please select a file");
      return;
    }

    try {
      setUploading(true);

      // Create form data for file upload
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Upload via our server-side API endpoint (secure method)
      const uploadRes = await axios.post("/api/upload", formData, {
        timeout: 60000, // 60 seconds timeout for upload
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Check for url in various possible formats
      const fileUrl =
        uploadRes.data?.secure_url ||
        uploadRes.data?.url ||
        uploadRes.data?.result?.secure_url;

      if (fileUrl) {
        // Save note data to MongoDB
        const noteData = {
          title: noteTitle.trim(),
          description: noteDescription.trim() || undefined,
          url: fileUrl,
          sectionId: (selectedSection as any)._id,
        };

        const saveRes = await axios.post("/api/note/create", noteData);

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
        toast.error(
          "Failed to get file URL from upload service. Check console for details."
        );
      }
    } catch (error: any) {
      let message = "Failed to add note";

      if (error.response) {
        message =
          error.response.data?.details ||
          error.response.data?.error ||
          error.response.data?.message ||
          "Server error during upload";
      } else if (error.request) {
        message =
          "No response from server. Check your network connection.";
      } else {
        message = error.message || "Unknown error occurred";
      }

      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

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

  // Lecture functions
  const openAddLectureDialog = (section: Section) => {
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

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Form reset functions
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

  useEffect(() => {
    if (params.name) {
      fetchBatch();
    }
  }, [params.name]);
  useEffect(() => {
    console.log("Batch data:", batch);
    if (batch?.users) {
      console.log("Users array:", batch.users);
      console.log(
        "Approved users:",
        batch.users.filter((user: any) => user.status === "approved")
      );
    }
  }, [batch]);

  useEffect(() => {
    if (batch?.notices && (batch as any).notices.length > 0) {
      console.log("Notice objects:", (batch as any).notices);
    }
  }, [batch]);

  const copyInviteCode = () => {
    if (batch?.inviteCode) {
      navigator.clipboard.writeText(batch.inviteCode);
      toast.success("Invite code copied to clipboard!");
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      // TODO: Implement API call to approve request
      const res = await axios.post("/api/admin/acceptrequest", {
        requestId,
      });
      toast.success("Request approved successfully");
      // Refresh batch data
      fetchBatch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error approving request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      // TODO: Implement API call to reject request
      const res = await axios.delete("/api/admin/rejectrequest", {
        data: { requestId },
      });
      toast.success("Request rejected successfully");
      // Refresh batch data
      fetchBatch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error rejecting request");
    }
  };

  // Add this function to prepare student attendance data
  const prepareAttendanceDialog = () => {
    if (batch.users && Array.isArray(batch.users)) {
      const students = (batch.users as BatchUser[])
        .filter(
          (user) =>
            user.status === "approved" &&
            Array.isArray(user.user) &&
            user.user[0]?.role === "student"
        )
        .map((userData) => {
          // MongoDB adds _id field which isn't in our TypeScript model
          // We use type assertion to safely access it
          const student = userData.user[0];
          return {
            studentId: (student as any)._id,
            name: student?.name || '',
            status: AttendanceStatus.present,
          };
        });
      
      setStudentAttendance(students);
      setSubject("");
      setPeriod("");
      setCreateAttendanceDialogOpen(true);
    }
  };
  
  // Add this function to toggle attendance status
  const toggleAttendanceStatus = (studentId: string) => {
    setStudentAttendance((prev) => 
      prev.map((student) => 
        student.studentId === studentId 
          ? { 
              ...student, 
              status: student.status === AttendanceStatus.present 
                ? AttendanceStatus.absent 
                : AttendanceStatus.present 
            } 
          : student
      )
    );
  };
  
  // Add this function to create attendance record
  const createAttendance = async () => {
    if (!subject.trim() || !period || studentAttendance.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setCreatingAttendance(true);
      
      const record = studentAttendance.map((student) => ({
        student: student.studentId,
        status: student.status,
      }));
      
      const res = await axios.post("/api/attendance/create", {
        batchId: (batch as any)._id,
        record,
        subject: subject.trim(),
        period: Number(period),
        createdById: (user as any)._id,
      });
      
      if (res.status === 201) {
        toast.success("Attendance record created successfully");
        setCreateAttendanceDialogOpen(false);
        await fetchBatch();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create attendance record");
    } finally {
      setCreatingAttendance(false);
    }
  };

  // Add this function to handle opening the attendance details dialog
  const handleViewAttendanceDetails = (record: any) => {
    setSelectedAttendanceRecord(record);
    setAttendanceDetailsDialogOpen(true);
  };

  // Notices functions
  const handleNoticeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      // Validate file type
      if (file.type !== "application/pdf") {
        setNoticeFileError("Only PDF files are allowed");
        setNoticeFile(null);
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setNoticeFileError("File size should be less than 5MB");
        setNoticeFile(null);
        return;
      }

      setNoticeFile(file);
      setNoticeFileError("");
    }
  };

  const resetNoticeForm = () => {
    setNoticeTitle("");
    setNoticeDescription("");
    setNoticeFile(null);
    setNoticeFileError("");
  };

  const handleCreateNotice = async () => {
    if (!noticeTitle.trim()) {
      return;
    }

    try {
      setCreatingNotice(true);
      let fileUrl = "";

      // Upload file if provided
      if (noticeFile) {
        // Create form data for file upload
        const formData = new FormData();
        formData.append("file", noticeFile);

        // Upload file
        const uploadRes = await axios.post("/api/upload", formData, {
          timeout: 60000,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Get the file URL
        fileUrl = uploadRes.data?.secure_url || uploadRes.data?.url || uploadRes.data?.result?.secure_url;
      }

      // Save notice to database
      const noticeData = {
        title: noticeTitle.trim(),
        description: noticeDescription.trim() || undefined,
        batchId: (batch as any)._id,
        ...(fileUrl && { attachmentUrl: fileUrl }),
        createdBy: (user as any)._id,
      };
      console.log(fileUrl);
      const res = await axios.post("/api/notice/create", noticeData);

      if (res.status === 201) {
        toast.success("Notice created successfully");
        await fetchBatch();
        setAddNoticeDialogOpen(false);
        resetNoticeForm();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create notice");
    } finally {
      setCreatingNotice(false);
    }
  };

  const handleDeleteNotice = async () => {
    if (!selectedNotice) return;

    try {
      setDeletingNotice(true);
      const res = await axios.post("/api/notice/delete", {
        noticeId: selectedNotice._id,
      });

      if (res.status === 200) {
        toast.success("Notice deleted successfully");
        await fetchBatch();
        setDeleteNoticeDialogOpen(false);
        setSelectedNotice(null);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to delete notice");
    } finally {
      setDeletingNotice(false);
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Batch: {params.name}</h1>
        {batch?.inviteCode && (
          <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
            <span className="font-medium">Invite Code:</span>
            <code className="bg-background px-2 py-1 rounded">
              {batch.inviteCode}
            </code>
            <Button variant="ghost" size="icon" onClick={copyInviteCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Tabs 
        defaultValue="students" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="lectures">Lectures</TabsTrigger>
          <TabsTrigger value="notices">Notices</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Students</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(batch.users) &&
                      (batch.users as BatchUser[])
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
                            <TableCell className="py-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      // Handle view details
                                    }}
                                  >
                                    View Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    {Array.isArray(batch.users) &&
                      (batch.users as BatchUser[]).filter(
                        (user) =>
                          user.status === "approved" &&
                          Array.isArray(user.user) &&
                          user.user[0]?.role === "student"
                      ).length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
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

            <Card>
              <CardHeader>
                <CardTitle>Pending Student Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(batch.requests) &&
                    (batch.requests as ExtendedRequest[])
                      .filter(
                        (request) =>
                          request.status === "pending" &&
                          (Array.isArray(request.sentBy)
                            ? request.sentBy[0]?.role === "student"
                            : request.sentBy?.role === "student")
                      )
                      .map((request, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <h3 className="font-medium">
                              {Array.isArray(request.sentBy)
                                ? request.sentBy[0]?.name
                                : request.sentBy?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {Array.isArray(request.sentBy)
                                ? request.sentBy[0]?.email
                                : request.sentBy?.email}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>User Details</DialogTitle>
                                  <DialogDescription>
                                    View and manage user request details
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div>
                                    <h4 className="font-medium">Name</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {Array.isArray(request.sentBy)
                                        ? request.sentBy[0]?.name
                                        : request.sentBy?.name}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Email</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {Array.isArray(request.sentBy)
                                        ? request.sentBy[0]?.email
                                        : request.sentBy?.email}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">
                                      Request Status
                                    </h4>
                                    <p className="text-sm text-muted-foreground capitalize">
                                      {request.status}
                                    </p>
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() =>
                                        handleApproveRequest(request._id)
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleRejectRequest(request._id)
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveRequest(request._id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectRequest(request._id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                  {Array.isArray(batch.requests) &&
                    (batch.requests as ExtendedRequest[]).filter(
                      (request) =>
                        request.status === "pending" &&
                        (Array.isArray(request.sentBy)
                          ? request.sentBy[0]?.role === "student"
                          : request.sentBy?.role === "student")
                    ).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No pending student requests
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teachers">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(batch.users) &&
                      (batch.users as BatchUser[])
                        .filter(
                          (user) =>
                            user.status === "approved" &&
                            Array.isArray(user.user) &&
                            user.user[0]?.role === "teacher"
                        )
                        .map((userData, index) => (
                          <TableRow key={index} className="h-12">
                            <TableCell className="py-2">
                              {userData.user[0]?.name}
                            </TableCell>
                            <TableCell className="py-2">
                              {userData.user[0]?.email}
                            </TableCell>
                            <TableCell className="py-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      // Handle view details
                                    }}
                                  >
                                    View Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    {Array.isArray(batch.users) &&
                      (batch.users as BatchUser[]).filter(
                        (user) =>
                          user.status === "approved" &&
                          Array.isArray(user.user) &&
                          user.user[0]?.role === "teacher"
                      ).length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-muted-foreground py-2"
                          >
                            No active teachers in this batch
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Teacher Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(batch.requests) &&
                    (batch.requests as ExtendedRequest[])
                      .filter(
                        (request) =>
                          request.status === "pending" &&
                          (Array.isArray(request.sentBy)
                            ? request.sentBy[0]?.role === "teacher"
                            : request.sentBy?.role === "teacher")
                      )
                      .map((request, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <h3 className="font-medium">
                              {Array.isArray(request.sentBy)
                                ? request.sentBy[0]?.name
                                : request.sentBy?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {Array.isArray(request.sentBy)
                                ? request.sentBy[0]?.email
                                : request.sentBy?.email}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Teacher Details</DialogTitle>
                                  <DialogDescription>
                                    View and manage teacher request details
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div>
                                    <h4 className="font-medium">Name</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {Array.isArray(request.sentBy)
                                        ? request.sentBy[0]?.name
                                        : request.sentBy?.name}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Email</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {Array.isArray(request.sentBy)
                                        ? request.sentBy[0]?.email
                                        : request.sentBy?.email}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">
                                      Request Status
                                    </h4>
                                    <p className="text-sm text-muted-foreground capitalize">
                                      {request.status}
                                    </p>
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() =>
                                        handleApproveRequest(request._id)
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleRejectRequest(request._id)
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveRequest(request._id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectRequest(request._id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                  {Array.isArray(batch.requests) &&
                    (batch.requests as ExtendedRequest[]).filter(
                      (request) =>
                        request.status === "pending" &&
                        (Array.isArray(request.sentBy)
                          ? request.sentBy[0]?.role === "teacher"
                          : request.sentBy?.role === "teacher")
                    ).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No pending teacher requests
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
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

        <TabsContent value="notices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notices</CardTitle>
              <Button 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setAddNoticeDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Create Notice</span>
              </Button>
            </CardHeader>
            <CardContent>
              {(batch as any).notices && (batch as any).notices.length > 0 ? (
                <div className="space-y-4">
                  {(batch as any).notices.map((notice: NoticeContent, index: number) => (
                    <Collapsible
                      key={index}
                      open={expandedSections[notice._id]}
                      onOpenChange={() => toggleSectionExpanded(notice._id)}
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
                              {expandedSections[notice._id] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <div>
                            <h3 className="text-base font-medium">{notice.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(notice.createdAt), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedNotice(notice);
                                setDeleteNoticeDialogOpen(true);
                              }}
                              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <CollapsibleContent>
                        <div className="p-4 space-y-3">
                          {notice.description && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium mb-1">Description</h4>
                              <p className="text-sm text-muted-foreground">{notice.description}</p>
                            </div>
                          )}
                          {(notice.url || notice.attachmentUrl) && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Attachment</h4>
                              <Card className="flex flex-col">
                                <div className="px-2.5 py-[1px]">
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="truncate">
                                      <p className="text-sm font-medium truncate leading-tight">
                                        Notice Attachment
                                      </p>
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        <FileText className="h-3 w-3 mr-1" />
                                        <span>
                                          {format(new Date(notice.createdAt), "MMM dd, yyyy")}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex gap-0.5 ml-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => {
                                          const fileUrl = notice.url || notice.attachmentUrl;
                                          if (!fileUrl) return;
                                          
                                          let urlToOpen = fileUrl;
                                          if (
                                            urlToOpen.includes("cloudinary.com") &&
                                            urlToOpen.includes("/image/upload/") &&
                                            urlToOpen.toLowerCase().endsWith(".pdf")
                                          ) {
                                            urlToOpen = urlToOpen.replace(
                                              "/image/upload/",
                                              "/raw/upload/"
                                            );
                                          }
                                          window.open(urlToOpen, "_blank");
                                        }}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => {
                                          const fileUrl = notice.url || notice.attachmentUrl;
                                          if (!fileUrl) return;

                                          // Fix Cloudinary URL if needed (for PDFs)
                                          let urlToDownload = fileUrl;
                                          if (
                                            urlToDownload.includes("cloudinary.com") &&
                                            urlToDownload.includes("/image/upload/") &&
                                            urlToDownload.toLowerCase().endsWith(".pdf")
                                          ) {
                                            urlToDownload = urlToDownload.replace(
                                              "/image/upload/",
                                              "/raw/upload/"
                                            );
                                          }

                                          // Show loading message
                                          const toastId = toast.loading(
                                            "Preparing download..."
                                          );

                                          // Try direct download using fetch
                                          fetch(urlToDownload)
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
                                              const blobUrl = URL.createObjectURL(blob);

                                              // Create a temporary anchor element for download
                                              const downloadLink = document.createElement("a");
                                              downloadLink.href = blobUrl;
                                              downloadLink.download = "notice_attachment.pdf";
                                              document.body.appendChild(downloadLink);
                                              downloadLink.click();

                                              // Clean up
                                              document.body.removeChild(downloadLink);
                                              URL.revokeObjectURL(blobUrl);

                                              // Show success message
                                              toast.success("Download started", {
                                                id: toastId,
                                              });
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
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No notices available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attendance</CardTitle>
              <Button 
                size="sm" 
                className="flex items-center gap-1"
                onClick={prepareAttendanceDialog}
              >
                <Plus className="h-4 w-4" />
                <span>Create Attendance</span>
              </Button>
            </CardHeader>
            <CardContent>
              {(batch as any).attendance && (batch as any).attendance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(batch as any).attendance?.map((record: any, index: number) => {
                      // Calculate present and absent counts
                      const presentCount = record.record.filter((r: any) => r.status === AttendanceStatus.present).length;
                      const absentCount = record.record.filter((r: any) => r.status === AttendanceStatus.absent).length;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>{format(new Date(record.createdAt), "MMM dd, yyyy")}</TableCell>
                          <TableCell>{record.subject}</TableCell>
                          <TableCell>{record.period}</TableCell>
                          <TableCell className="text-center">{presentCount}</TableCell>
                          <TableCell className="text-center">{absentCount}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    // View details functionality
                                    handleViewAttendanceDetails(record);
                                  }}
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAttendanceRecord(record);
                                    setDeleteAttendanceDialogOpen(true);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">No attendance records available.</p>
              )}
            </CardContent>
          </Card>
          
          {/* Create Attendance Dialog */}
          <Dialog 
            open={createAttendanceDialogOpen} 
            onOpenChange={setCreateAttendanceDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Attendance Record</DialogTitle>
                <DialogDescription>
                  Take attendance for the class session. Mark students as present or absent.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Subject <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="subject"
                      placeholder="Enter subject name"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period">
                      Period <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="period"
                      type="number"
                      placeholder="Enter period number"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Students</Label>
                  {studentAttendance.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-[120px] text-center">Present</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentAttendance.map((student, index) => (
                          <TableRow key={index}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                {student.status === AttendanceStatus.present ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <Switch
                                  checked={student.status === AttendanceStatus.present}
                                  onCheckedChange={() => toggleAttendanceStatus(student.studentId)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No students in this batch
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateAttendanceDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createAttendance}
                  disabled={!subject.trim() || !period || studentAttendance.length === 0 || creatingAttendance}
                >
                  {creatingAttendance ? "Saving..." : "Save Attendance"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

      {/* Attendance Details Dialog */}
      <Dialog
        open={attendanceDetailsDialogOpen}
        onOpenChange={setAttendanceDetailsDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription>
              {selectedAttendanceRecord && (
                <>
                  Subject: {selectedAttendanceRecord.subject} | 
                  Period: {selectedAttendanceRecord.period} | 
                  Date: {format(new Date(selectedAttendanceRecord.createdAt), "MMM dd, yyyy")}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedAttendanceRecord && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedAttendanceRecord.record.map((item: any, index: number) => {
                    // Find student name from batch users data
                    const studentUser = (batch as any).users?.find(
                      (u: any) => (u.user[0] as any)._id === item.student
                    );
                    const studentName = studentUser ? studentUser.user[0]?.name : "Unknown Student";
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>{studentName}</TableCell>
                        <TableCell className="text-center">
                          {item.status === AttendanceStatus.present ? (
                            <div className="flex justify-center items-center">
                              <CheckCircle2 className="h-5 w-5 text-green-500 mr-1" /> 
                              <span>Present</span>
                            </div>
                          ) : (
                            <div className="flex justify-center items-center">
                              <XCircle className="h-5 w-5 text-red-500 mr-1" /> 
                              <span>Absent</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setAttendanceDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Attendance Dialog */}
      <Dialog
        open={deleteAttendanceDialogOpen}
        onOpenChange={setDeleteAttendanceDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Attendance Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteAttendanceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAttendance}
              disabled={deletingAttendance}
            >
              {deletingAttendance ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Notice Dialog */}
      <Dialog
        open={addNoticeDialogOpen}
        onOpenChange={(open) => {
          setAddNoticeDialogOpen(open);
          if (!open) resetNoticeForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Notice</DialogTitle>
            <DialogDescription>
              Create a new notice for all batch members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="notice-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="notice-title"
                placeholder="Enter notice title"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
              />
              {!noticeTitle.trim() && (
                <p className="text-sm text-destructive mt-1">
                  Title is required
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice-description">Description</Label>
              <Textarea
                id="notice-description"
                placeholder="Enter notice details"
                value={noticeDescription}
                onChange={(e) => setNoticeDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice-file">Attachment (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={noticeFileInputRef}
                  id="notice-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleNoticeFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => noticeFileInputRef.current?.click()}
                  className="w-full"
                >
                  {noticeFile ? noticeFile.name : "Select PDF File (Optional)"}
                </Button>
              </div>
              {noticeFileError && (
                <p className="text-sm text-destructive mt-1">{noticeFileError}</p>
              )}
              {noticeFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Size: {(noticeFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setAddNoticeDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNotice}
              disabled={!noticeTitle.trim() || creatingNotice}
              className="w-full sm:w-auto"
            >
              {creatingNotice ? "Creating..." : "Create Notice"}
            </Button>
          </DialogFooter>
          {creatingNotice && noticeFile && (
            <div className="mt-2 text-center text-sm text-muted-foreground">
              Uploading attachment... This may take a moment.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Notice Dialog */}
      <Dialog
        open={deleteNoticeDialogOpen}
        onOpenChange={setDeleteNoticeDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedNotice?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteNoticeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNotice}
              disabled={deletingNotice}
            >
              {deletingNotice ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
