import type { Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/client";
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AptiQuiz — Live Aptitude Battles",
  description:
    "Practice aptitude and logical reasoning in real-time multiplayer quiz rooms.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          {/* Nav is a Server Component — reads session with zero client JS */}
          <Nav />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
