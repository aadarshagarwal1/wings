import Image, { StaticImageData } from "next/image";

interface TestimonialCardProps {
  image: StaticImageData;
  name: string;
  quote: string;
}

export default function TestimonialCard({
  image,
  name,
  quote,
}: TestimonialCardProps) {
  return (
    <div className="group relative flex flex-col p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      {/* Quote Icon */}
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.203 2.472-5.99 6-5.99s6 2.787 6 5.99c0 1.989-.553 3.216-1.583 4.31l-3.417 3.34-3.417-3.34zm10 0C13.553 16.227 13 15 13 13.011c0-3.203 2.472-5.99 6-5.99s6 2.787 6 5.99c0 1.989-.553 3.216-1.583 4.31l-3.417 3.34-3.417-3.34z" />
        </svg>
      </div>

      {/* Quote Text */}
      <p className="text-muted-foreground text-lg leading-relaxed mb-6">
        {quote}
      </p>

      {/* Profile Section */}
      <div className="flex items-center gap-4 mt-auto">
        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-border/50">
          <Image
            src={image}
            alt={`${name}'s profile picture`}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 3.94 1.687a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zm5.99 7.176A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            <span>JEE Mains AIR 200</span>
            <span>•</span>
            <span>IIT Bombay, 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}
