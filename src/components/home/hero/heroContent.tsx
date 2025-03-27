import { Button } from "@/components/ui/button";

export default function HeroContent() {
  return (
    <div className="flex flex-col gap-6 md:items-start items-center text-center md:text-left justify-center min-h-[500px]">
      <h1 className="text-7xl md:text-8xl font-light tracking-tighter text-gray-900">
        Wings
      </h1>
      <h2 className="text-2xl md:text-3xl font-light text-gray-700 max-w-2xl">
        One stop coaching solution for all competitive exams
      </h2>
      <p className="text-lg text-gray-500 max-w-xl">
        We provide the best coaching for all competitive exams with personalized
        attention and proven results.
      </p>
      <Button className="mt-4 px-8 py-6 text-lg bg-gray-900 hover:bg-gray-800 transition-colors">
        Enroll Now
      </Button>
    </div>
  );
}
