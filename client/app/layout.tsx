import { Alert } from "@/features/ui/alert";
import { Navbar } from "@/features/ui/navbar";
import { ThemeProvider } from "@/features/ui/theme";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className={`${inter.className} bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <Alert />
          <main className="px-4 py-16 sm:px-6 lg:px-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
