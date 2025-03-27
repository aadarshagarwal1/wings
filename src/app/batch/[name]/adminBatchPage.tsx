"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Batch } from "@/models/batch.model";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Copy, MoreVertical } from "lucide-react";
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

interface ExtendedRequest extends Request {
  _id: string;
}

interface BatchUser {
  user: User[];
  status: "pending" | "approved" | "rejected";
  _id: string;
}

export default function AdminBatchPage({
  params,
}: {
  params: { name: string };
}) {
  const router = useRouter();
  const { batch, setBatch } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

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

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="lectures">Lectures</TabsTrigger>
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
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Study materials and notes will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lectures">
          <Card>
            <CardHeader>
              <CardTitle>Lectures</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Lecture schedule and recordings will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Attendance records and statistics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
