import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PracticePal",
  description: "Practice tracking for musicians.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="practicapal" className="bg-base-200">
      <body className="font-sans">{children}</body>
    </html>
  );
}
