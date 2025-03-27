"use client";
import { useParams } from "next/navigation";

export default function profile() {
  const params = useParams();
  return (
    <div>
      <div>Profile</div>
      <span>{params.id}</span>
    </div>
  );
}
