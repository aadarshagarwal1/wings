import React from "react";

interface SectionHeadingProps {
  title: string;
}

export default function SectionHeading({ title }: SectionHeadingProps) {
  return (
    <div className="flex flex-col items-center gap-4 mb-12">
      <h2 className="text-3xl md:text-5xl font-bold text-gray-900 text-center">
        {title}
      </h2>
      <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gray-900 to-transparent rounded-full" />
    </div>
  );
}
