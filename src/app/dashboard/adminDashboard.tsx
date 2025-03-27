"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useAppContext } from "@/context";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Plus,
  RefreshCw,
  UserCog,
  Ban,
  UserPlus,
  UserMinus,
} from "lucide-react";
import BatchCard from "@/components/dashboard/batchCard";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  inviteCode: z
    .string()
    .min(8, { message: "Invite code must be 8 characters" })
    .max(8, { message: "Invite code must be 8 characters" }),
});

const generateInviteCode = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function AdminDashboard() {
  const { user } = useAppContext();
  const [batches, setBatches] = useState<{
    active: any[];
    archived: any[];
  }>({ active: [], archived: [] });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("batches");

  const [users, setUsers] = useState<{
    teachers: {
      active: any[];
      suspended: any[];
    };
    students: {
      active: any[];
      suspended: any[];
    };
  }>({
    teachers: { active: [], suspended: [] },
    students: { active: [], suspended: [] },
  });

  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isSwitchRoleDialogOpen, setIsSwitchRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    role: string;
    name: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      inviteCode: generateInviteCode(),
    },
  });

  const refreshInviteCode = () => {
    form.setValue("inviteCode", generateInviteCode());
  };

  const fetchBatches = async () => {
    try {
      const response = await axios.get(
        `/api/batches/get?userIdString=${user?._id}`
      );
      setBatches(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [user]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const handleCreateBatch = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post("/api/batches/createbatch", {
        name: values.name,
        inviteCode: values.inviteCode,
        userIdString: user?._id,
      });
      toast.success("Batch created successfully");
      setIsCreateDialogOpen(false);
      form.reset();
      fetchBatches();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create batch");
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `/api/users/get?userIdString=${user?._id}`
      );
      const data = response.data.data;

      // Separate active and suspended users
      const teachers = {
        active: data.teachers.filter((t: any) => !t.isSuspended),
        suspended: data.teachers.filter((t: any) => t.isSuspended),
      };
      const students = {
        active: data.students.filter((s: any) => !s.isSuspended),
        suspended: data.students.filter((s: any) => s.isSuspended),
      };

      setUsers({ teachers, students });
    } catch (error) {
      toast.error("Failed to fetch users");
      console.log(error);
    }
  };

  const handleSuspendAccount = async (userId: string) => {
    try {
      const response = await axios.post("/api/users/suspend", { userId });
      toast.success("Account suspended successfully");
      setIsSuspendDialogOpen(false);
      fetchUsers();
      console.log(response);
    } catch (error) {
      console.log(error);
      toast.error("Failed to suspend account");
    }
  };

  const handleUnsuspendAccount = async (userId: string) => {
    try {
      const response = await axios.post("/api/users/unsuspend", { userId });
      toast.success("Account unsuspended successfully");
      setIsSuspendDialogOpen(false);
      fetchUsers();
      console.log(response);
    } catch (error) {
      console.log(error);
      toast.error("Failed to unsuspend account");
    }
  };

  const handleSwitchRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === "teacher" ? "student" : "teacher";
      await axios.post(`/api/users/switch-role/${userId}`, { newRole });
      toast.success("Role switched successfully");
      setIsSwitchRoleDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to switch role");
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="w-full px-6 py-6">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          <Tabs
            defaultValue="batches"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="batches">Batches</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="batches" className="mt-6">
              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Batches Management</h2>
                  <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Batch
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Batch</DialogTitle>
                        <DialogDescription>
                          Enter the details for the new batch.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(handleCreateBatch)}
                          className="grid gap-4 py-4"
                        >
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Batch Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter batch name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="inviteCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Invite Code</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input {...field} readOnly />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={refreshInviteCode}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit">Create Batch</Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">
                    Active Batches
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {batches.active.map((batch) => (
                      <Link href={`/batch/${batch.name}`} key={batch.name}>
                        <BatchCard
                          key={batch.name}
                          batch={batch}
                          onUpdate={fetchBatches}
                        />
                      </Link>
                    ))}
                  </div>
                </div>

                <Separator className="my-8" />

                <div>
                  <h2 className="text-2xl font-semibold mb-4">
                    Archived Batches
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {batches.archived.map((batch) => (
                      <Link href={`/batch/${batch.name}`} key={batch.name}>
                        <BatchCard
                          key={batch.name}
                          batch={batch}
                          onUpdate={fetchBatches}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <div className="rounded-lg border p-4">
                <h2 className="text-xl font-semibold mb-4">Users Management</h2>

                <div className="mb-12">
                  <h3 className="text-2xl font-semibold mb-4">Teachers</h3>
                  <div className="space-y-4">
                    <div className="hidden md:flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-lg">Name</p>
                        <p className="text-sm text-gray-500">Email</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <p className="font-medium text-lg">Actions</p>
                      </div>
                    </div>
                    {users.teachers.active.map((teacher) => (
                      <div
                        key={teacher._id}
                        className="flex items-center justify-between p-4 border rounded-lg gap-15"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-lg truncate">
                            {teacher.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {teacher.email}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Dialog
                            open={
                              isSwitchRoleDialogOpen &&
                              selectedUser?.id === teacher._id
                            }
                            onOpenChange={setIsSwitchRoleDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="md:hidden"
                                onClick={() =>
                                  setSelectedUser({
                                    id: teacher._id,
                                    role: "teacher",
                                    name: teacher.name,
                                  })
                                }
                              >
                                <UserCog className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Switch Role</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to switch{" "}
                                  {selectedUser?.name}'s role to Student?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setIsSwitchRoleDialogOpen(false)
                                  }
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleSwitchRole(
                                      selectedUser?.id || "",
                                      "teacher"
                                    )
                                  }
                                >
                                  Confirm
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={
                              isSuspendDialogOpen &&
                              selectedUser?.id === teacher._id
                            }
                            onOpenChange={setIsSuspendDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="md:hidden"
                                onClick={() =>
                                  setSelectedUser({
                                    id: teacher._id,
                                    role: "teacher",
                                    name: teacher.name,
                                  })
                                }
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Suspend Account</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to suspend{" "}
                                  {selectedUser?.name}'s account?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setIsSuspendDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    handleSuspendAccount(selectedUser?.id || "")
                                  }
                                >
                                  Confirm
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            className="hidden md:flex"
                            onClick={() => {
                              setSelectedUser({
                                id: teacher._id,
                                role: "teacher",
                                name: teacher.name,
                              });
                              setIsSwitchRoleDialogOpen(true);
                            }}
                          >
                            Switch to Student
                          </Button>
                          <Button
                            variant="destructive"
                            className="hidden md:flex"
                            onClick={() => {
                              setSelectedUser({
                                id: teacher._id,
                                role: "teacher",
                                name: teacher.name,
                              });
                              setIsSuspendDialogOpen(true);
                            }}
                          >
                            Suspend Account
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {users.teachers.suspended.length > 0 && (
                    <>
                      <Separator className="my-8" />
                      <h3 className="text-2xl font-semibold mb-4">
                        Suspended Teachers
                      </h3>
                      <div className="space-y-4">
                        {users.teachers.suspended.map((teacher) => (
                          <div
                            key={teacher._id}
                            className="flex items-center justify-between p-4 border rounded-lg gap-15 bg-muted/30"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-lg truncate">
                                {teacher.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {teacher.email}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Dialog
                                open={
                                  isSuspendDialogOpen &&
                                  selectedUser?.id === teacher._id
                                }
                                onOpenChange={setIsSuspendDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="md:hidden"
                                    onClick={() =>
                                      setSelectedUser({
                                        id: teacher._id,
                                        role: "teacher",
                                        name: teacher.name,
                                      })
                                    }
                                  >
                                    <UserPlus className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Unsuspend Account</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to unsuspend{" "}
                                      {selectedUser?.name}'s account?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-center gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        setIsSuspendDialogOpen(false)
                                      }
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleUnsuspendAccount(
                                          selectedUser?.id || ""
                                        )
                                      }
                                    >
                                      Confirm
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="outline"
                                className="hidden md:flex"
                                onClick={() => {
                                  setSelectedUser({
                                    id: teacher._id,
                                    role: "teacher",
                                    name: teacher.name,
                                  });
                                  setIsSuspendDialogOpen(true);
                                }}
                              >
                                Unsuspend Account
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <Separator className="my-8" />

                <div>
                  <h3 className="text-2xl font-semibold mb-4">Students</h3>
                  <div className="space-y-4">
                    <div className="hidden md:flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-lg">Name</p>
                        <p className="text-sm text-gray-500">Email</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <p className="font-medium text-lg">Actions</p>
                      </div>
                    </div>
                    {users.students.active.map((student) => (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-lg truncate">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {student.email}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Dialog
                            open={
                              isSwitchRoleDialogOpen &&
                              selectedUser?.id === student._id
                            }
                            onOpenChange={setIsSwitchRoleDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="md:hidden"
                                onClick={() =>
                                  setSelectedUser({
                                    id: student._id,
                                    role: "student",
                                    name: student.name,
                                  })
                                }
                              >
                                <UserCog className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Switch Role</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to switch{" "}
                                  {selectedUser?.name}'s role to Teacher?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setIsSwitchRoleDialogOpen(false)
                                  }
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleSwitchRole(
                                      selectedUser?.id || "",
                                      "student"
                                    )
                                  }
                                >
                                  Confirm
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={
                              isSuspendDialogOpen &&
                              selectedUser?.id === student._id
                            }
                            onOpenChange={setIsSuspendDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="md:hidden"
                                onClick={() =>
                                  setSelectedUser({
                                    id: student._id,
                                    role: "student",
                                    name: student.name,
                                  })
                                }
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Suspend Account</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to suspend{" "}
                                  {selectedUser?.name}'s account?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setIsSuspendDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    handleSuspendAccount(selectedUser?.id || "")
                                  }
                                >
                                  Confirm
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            className="hidden md:flex"
                            onClick={() => {
                              setSelectedUser({
                                id: student._id,
                                role: "student",
                                name: student.name,
                              });
                              setIsSwitchRoleDialogOpen(true);
                            }}
                          >
                            Switch to Teacher
                          </Button>
                          <Button
                            variant="destructive"
                            className="hidden md:flex"
                            onClick={() => {
                              setSelectedUser({
                                id: student._id,
                                role: "student",
                                name: student.name,
                              });
                              setIsSuspendDialogOpen(true);
                            }}
                          >
                            Suspend Account
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {users.students.suspended.length > 0 && (
                    <>
                      <Separator className="my-8" />
                      <h3 className="text-2xl font-semibold mb-4">
                        Suspended Students
                      </h3>
                      <div className="space-y-4">
                        {users.students.suspended.map((student) => (
                          <div
                            key={student._id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-lg truncate">
                                {student.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {student.email}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Dialog
                                open={
                                  isSuspendDialogOpen &&
                                  selectedUser?.id === student._id
                                }
                                onOpenChange={setIsSuspendDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="md:hidden"
                                    onClick={() =>
                                      setSelectedUser({
                                        id: student._id,
                                        role: "student",
                                        name: student.name,
                                      })
                                    }
                                  >
                                    <UserPlus className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Unsuspend Account</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to unsuspend{" "}
                                      {selectedUser?.name}'s account?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-center gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        setIsSuspendDialogOpen(false)
                                      }
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleUnsuspendAccount(
                                          selectedUser?.id || ""
                                        )
                                      }
                                    >
                                      Confirm
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="outline"
                                className="hidden md:flex"
                                onClick={() => {
                                  setSelectedUser({
                                    id: student._id,
                                    role: "student",
                                    name: student.name,
                                  });
                                  setIsSuspendDialogOpen(true);
                                }}
                              >
                                Unsuspend Account
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
