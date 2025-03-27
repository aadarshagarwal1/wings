"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function verifyemail() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyEmail = async (token: any) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post("/api/users/verifyemail", { token });
      toast.success(response.data.message);
      // Redirect to login page after successful verification
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.log(error);
      setError(error.response?.data?.error || "Verification failed");
      toast.error(error.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tokenFromUrl = window.location.search.split("=")[1];
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, []);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {loading && (
          <div className="mb-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2">Verifying your email...</p>
          </div>
        )}
        {error && (
          <div className="text-red-500">
            <p>{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 text-blue-500 hover:underline"
            >
              Return to Login
            </button>
          </div>
        )}
        {!loading && !error && (
          <div>
            <h1 className="text-2xl font-bold">Email Verification</h1>
            <p className="mt-2">Please wait while we verify your email...</p>
          </div>
        )}
      </div>
    </div>
  );
}
