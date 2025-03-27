"use client";

import Image from "next/image";
import logo from "../../../data/assets/logo.png";
import { Button } from "../ui/button";
import Link from "next/link";
import Sidebar from "./sidebar";
import { ScrollToTop } from "../ui/scroll-to-top";

export default function Header() {
  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sidebar />
              <Image
                width={120}
                height={40}
                src={logo}
                alt="logo"
                className="ml-4"
              />
            </div>

            <nav className="hidden md:flex items-center space-x-8 uppercase">
              <Link
                href="#"
                className="text-sm font-medium text-gray-700 hover:text-red-500 transition-colors "
              >
                HOME
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-gray-700 hover:text-red-500 transition-colors"
              >
                About
              </Link>
              <Link
                href="#courses"
                className="text-sm font-medium text-gray-700 hover:text-red-500 transition-colors"
              >
                Courses
              </Link>
              <Link
                href="#faculty"
                className="text-sm font-medium text-gray-700 hover:text-red-500 transition-colors"
              >
                Faculty
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium text-gray-700 hover:text-red-500 transition-colors"
              >
                Testimonials
              </Link>
              <Link
                href="#contact"
                className="text-sm font-medium text-gray-700 hover:text-red-500 transition-colors"
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="flex  items-center gap-2 border-gray-200 hover:bg-gray-100"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <ScrollToTop />
    </>
  );
}
