"use client";

import React, { useState, useEffect } from "react";
import HeroHighLighter from "@repo/ui/components/svgs/HeroHighLighter";
import Image from "next/image";
import SamplePic from "../../../public/Praveen.jpg";
import MobileHomePage from "../Pages/Mobile";
import LargeScrHomePage from "../Pages/Large";

export default function HomePageContent() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="ui-flex ui-h-full ui-w-full ui-items-center ui-justify-center">
      {isMobile ? <MobileHomePage /> : <LargeScrHomePage />}
    </div>
  );
}
