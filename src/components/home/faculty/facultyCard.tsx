import Image, { StaticImageData } from "next/image";

export default function FacultyCard({ image }: { image: StaticImageData }) {
  return (
    <div className="group flex flex-col gap-6 items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-50 h-full hover:-translate-y-1">
      <div className="relative w-40 h-40 overflow-hidden rounded-full">
        <Image
          src={image}
          alt="faculty member"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
          Faculty Name
        </h1>
        <h3 className="text-sm font-medium text-blue-500 tracking-wide">
          Chemistry
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 max-w-xs">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos.
        </p>
      </div>
    </div>
  );
}
