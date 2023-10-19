import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/features/layout/navbar/navbar";
import { Alert } from "@/features/layout/alert";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "Keycat | %s",
    default: "Keycat",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <Alert />
        <main className="px-4 sm:px-6 lg:px-8 py-16">{children}</main>
      </body>
    </html>
  );
}
