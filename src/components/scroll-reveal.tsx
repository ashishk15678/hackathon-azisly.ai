"use client";

import { useEffect, useRef } from "react";

export function ScrollReveal() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const selectors = [
      ".reveal",
      ".reveal-left",
      ".reveal-right",
      ".reveal-scale",
    ];

    const elements = document.querySelectorAll<HTMLElement>(selectors.join(","));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
