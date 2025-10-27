import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// Use a clean, modern font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "CodeMinds Admin Dashboard",
  description:
    "Manage student tasks, monitor progress, and review submissions — the official CodeMinds Admin Dashboard.",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  authors: [{ name: "CodeMinds Team" }],
  keywords: [
    "CodeMinds",
    "Admin Dashboard",
    "Task Management",
    "Students Portal",
    "Code Community",
  ],
  openGraph: {
    title: "CodeMinds Admin Dashboard",
    description:
      "Admin panel to manage CodeMinds students, tasks, and reviews.",
    url: "https://your-website-url.com",
    siteName: "CodeMinds",
    images: [
      {
        url: "/codeminds-logo.png",
        width: 1200,
        height: 630,
        alt: "CodeMinds Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} bg-gray-50 text-gray-900 font-poppins antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
