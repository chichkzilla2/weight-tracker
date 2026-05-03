"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export default function AppToaster() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <Toaster
      position={isMobile ? "top-center" : "bottom-right"}
      mobileOffset={{
        top: "calc(env(safe-area-inset-top, 0px) + 20px)",
        right: "12px",
        bottom: "12px",
        left: "12px",
      }}
      toastOptions={{
        classNames: {
          success: "border-[#F59E0B]/35 bg-[#2A1B0A] text-[#FFE8B8]",
          error: "border-[#6B2A2A]/70 bg-[#2A1719] text-[#F2C8C8]",
        },
      }}
    />
  );
}
