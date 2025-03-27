import FacultyCard from "./facultyCard";
import image from "../../../../data/assets/faculty/image.png";
import SectionHeading from "@/components/ui/section-heading";

export default function Faculty() {
  return (
    <section id="faculty">
      <div className="flex flex-col gap-8 max-w-7xl mx-auto px-4 py-8">
        <SectionHeading title="Our Esteemed Faculty" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-items-center justify-self-center mx-auto">
          <FacultyCard image={image} />
          <FacultyCard image={image} />
          <FacultyCard image={image} />
          <FacultyCard image={image} />
          <FacultyCard image={image} />
        </div>
      </div>
    </section>
  );
}
