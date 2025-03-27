import Image from "next/image";
import { StaticImageData } from "next/image";

interface DataPointsProps {
  image: string | StaticImageData;
}

export default function DataPoints({ image }: DataPointsProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="relative w-16 h-16 mb-4">
        <Image src={image} alt="dataPoints" fill className="object-contain" />
      </div>
      <h3 className="text-3xl font-bold text-gray-800 mb-1">50+</h3>
      <p className="text-sm font-medium text-gray-600">Rankers</p>
    </div>
  );
}
