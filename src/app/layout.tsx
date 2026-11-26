import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "YREL — Your city, your ride", description: "YREL ride booking platform" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
