import TestimonialCard from "./testimonialCard";
import image from "../../../../data/assets/testimonials/image.png";
import SectionHeading from "@/components/ui/section-heading";

export default function Testimonials() {
  return (
    <section id="testimonials">
      <div className="flex flex-col gap-8 sm:gap-12 max-w-7xl mx-auto px-4 py-8 sm:py-16">
        <SectionHeading title="Testimonials" />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 w-full items-center justify-items-center">
          <TestimonialCard
            image={image}
            name="John Doe"
            quote="Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam fugit delectus ipsum debitis necessitatibus voluptates pariatur deleniti minima beatae dolores."
          />

          <TestimonialCard
            image={image}
            name="John Doe"
            quote="Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam fugit delectus ipsum debitis necessitatibus voluptates pariatur deleniti minima beatae dolores."
          />
          <TestimonialCard
            image={image}
            name="John Doe"
            quote="Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam fugit delectus ipsum debitis necessitatibus voluptates pariatur deleniti minima beatae dolores."
          />
          <TestimonialCard
            image={image}
            name="John Doe"
            quote="Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam fugit delectus ipsum debitis necessitatibus voluptates pariatur deleniti minima beatae dolores."
          />
        </div>
      </div>
    </section>
  );
}
