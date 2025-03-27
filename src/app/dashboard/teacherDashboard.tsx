"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/context";
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
import { Plus } from "lucide-react";
import BatchCard from "@/components/dashboard/batchCard";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";

const formSchema = z.object({
  inviteCode: z
    .string()
    .min(8, { message: "Invite code must be 8 characters" })
    .max(8, { message: "Invite code must be 8 characters" }),
});

export default function TeacherDashboard() {
  const { user } = useAppContext();
  const [teachingBatches, setTeachingBatches] = useState<any[]>([]);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  useEffect(() => {
    fetchTeachingBatches();
  }, [user]);

  const fetchTeachingBatches = async () => {
    try {
      const response = await axios.get(
        `/api/batches/get?userIdString=${user?._id}`
      );
      setTeachingBatches(response.data.data.active);
    } catch (error) {
      console.log(error);
    }
  };

  const handleJoinBatch = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await axios.post("/api/batches/sendrequest", {
        inviteCode: values.inviteCode,
        userIdString: user?._id,
      });
      toast.success(res.data.message);
      setIsJoinDialogOpen(false);
      form.reset();
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error joining batch");
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="w-full px-6 py-6">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

          <div className="rounded-lg border p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Batches</h2>
              <Dialog
                open={isJoinDialogOpen}
                onOpenChange={setIsJoinDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Join Batch
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join a Batch</DialogTitle>
                    <DialogDescription>
                      Enter the invite code to join a batch.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleJoinBatch)}
                      className="grid gap-4 py-4"
                    >
                      <FormField
                        control={form.control}
                        name="inviteCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invite Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter 8-character invite code"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Join Batch</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Teaching Batches</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {teachingBatches?.map((batch) => (
                  <Link href={`/batch/${batch.name}`} key={batch.name}>
                    <BatchCard
                      key={batch.name}
                      batch={batch}
                      onUpdate={fetchTeachingBatches}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
