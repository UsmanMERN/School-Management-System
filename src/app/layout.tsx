import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const ICONS = [
  { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
  {
    url: "/android-chrome-maskable-192x192.png",
    type: "image/png",
    sizes: "192x192",
  },
  { url: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
  {
    url: "/android-chrome-maskable-512x512.png",
    type: "image/png",
    sizes: "512x512",
  },
  { url: "/apple-touch-icon.png", type: "image/png" },
  { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" }, 
  { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
  { url: "/favicon.ico", type: "image/x-icon" },
];

const APP_NAME = "EduStream"
const APP_DEFAULT_TITLE = "EduStream: School Management System"
const APP_TITLE_TEMPLATE = "%s - EduStream"
const APP_DESCRIPTION = "Revolutionize your school management with our comprehensive app designed to connect admins, teachers, parents, and students. This platform offers seamless management of school data, including staff, parents, and students, with full editing capabilities for administrators. Teachers can easily take attendance and access real-time analytics on attendance rates, while students and teachers receive personalized schedule calendars based on the school timetable. Parents can conveniently view the schedules of all their children, ensuring they stay informed. Plus, share important announcements and events school-wide to keep everyone in the loop. Enhance communication, boost efficiency, and elevate your school community with our powerful management tool";

export const viewport = {
  themeColor: "#000",
};

export const metadata: Metadata = {
  applicationName: APP_NAME,
  icons: ICONS,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
