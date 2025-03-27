"use client";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/context";
export default function profile() {
  const router = useRouter();
  const { user, setUser } = useAppContext();

  const changePassword = async () => {
    try {
      await axios.post("/api/users/send-reset-email", {
        email: user.email,
        userId: user._id,
      });
      toast.success("Check inbox for password reset link");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to send reset email"
      );
      console.log(error);
    }
  };
  const { mode, toggleMode } = useAppContext();
  return (
    <div>
      <div>
        <h1>Email: {user?.email || ""}</h1>
        <h1>
          Name:{" "}
          {user ? <Link href={`/profile/${user.name}`}>{user.name}</Link> : ""}
        </h1>
        <h1>Role: {user?.role || ""}</h1>
        <h1>Batch: {user?.batch || ""}</h1>
        <h1>ID: {user?._id || ""}</h1>
      </div>
      <Button onClick={changePassword} variant={"outline"}>
        Change Password
      </Button>
      <h1>{mode}</h1>
      <Button onClick={toggleMode}>Toggle Mode</Button>
    </div>
  );
}
