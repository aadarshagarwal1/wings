import Header from "@/components/home/header";
import Hero from "@/components/home/hero/hero";
import InstituteOverview from "@/components/home/instituteOverview/instituteOverview";
import Courses from "@/components/home/courses/courses";
import Faculty from "@/components/home/faculty/faculty";
import Testimonials from "@/components/home/testimonials/testimonials";
import Contact from "@/components/home/contact/contact";
import Footer from "@/components/home/footer/footer";

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <InstituteOverview />
      <Courses />
      <Faculty />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
