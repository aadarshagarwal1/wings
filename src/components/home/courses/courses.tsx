import CourseCard from "./courseCard";
import image from "../../../../data/assets/courses/image.png";
import SectionHeading from "@/components/ui/section-heading";

export default function Courses() {
  return (
    <section id="courses">
      <div className="flex flex-col gap-8 max-w-7xl mx-auto px-4 py-8">
        <SectionHeading title="Our Courses" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-items-center justify-self-center mx-auto">
          <CourseCard image={image} />
          <CourseCard image={image} />
          <CourseCard image={image} />
          <CourseCard image={image} />
          <CourseCard image={image} />
        </div>
      </div>
    </section>
  );
}
