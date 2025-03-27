import Image, { StaticImageData } from "next/image";

export default function CourseCard({ image }: { image: StaticImageData }) {
  return (
    <div className="group flex flex-col gap-3 items-center justify-center p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full hover:-translate-y-1">
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl">
        <Image
          src={image}
          alt="course image"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h1 className="text-lg font-semibold text-gray-800 text-center group-hover:text-gray-900 transition-colors duration-300">
        Course Name
      </h1>
      <p className="text-sm text-gray-500 text-center line-clamp-2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
      </p>
      <button className="mt-1 px-5 py-1.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
        Learn More
      </button>
    </div>
  );
}
