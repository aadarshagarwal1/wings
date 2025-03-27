import DataPoints from "./dataPoints";
import image from "../../../../data/assets/intituteOverview/image.png";
import SectionHeading from "@/components/ui/section-heading";

export default function InstituteOverview() {
  return (
    <section id="about">
      <div className="flex flex-col md:flex-row gap-12 p-8 md:p-16 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 md:w-1/2">
          <SectionHeading title="Premiere coaching institute of Dhanbad" />
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            We are a team of experienced teachers who are dedicated to providing
            the best coaching for all competitive exams. Our commitment to
            excellence and personalized learning approach sets us apart. Lorem
            ipsum dolor sit amet consectetur, adipisicing elit. Provident magnam
            magni neque ipsum sit numquam quam. Velit, esse cum. Odio?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:w-1/2">
          <DataPoints image={image} />
          <DataPoints image={image} />
          <DataPoints image={image} />
          <DataPoints image={image} />
        </div>
      </div>
    </section>
  );
}
