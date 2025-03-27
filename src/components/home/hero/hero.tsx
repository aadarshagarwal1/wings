"use client";

import { Button } from "../../ui/button";
import { CarouselPlugin } from "./carousel";
import HeroContent from "./heroContent";
import hero1 from "../../../../data/assets/hero/1.png";
import hero2 from "../../../../data/assets/hero/2.png";

const heroImages = [
  {
    src: hero1,
    alt: "Hero image 1",
  },
  {
    src: hero2,
    alt: "Hero image 2",
  },
];

export default function Hero() {
  return (
    <section id="home">
      <div className="w-full bg-white">
        <div className="flex flex-col md:flex-row-reverse w-full max-w-7xl mx-auto justify-between py-16 px-4 md:px-8 gap-12">
          <HeroContent />
          <CarouselPlugin images={heroImages} />
        </div>
      </div>
    </section>
  );
}
