import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  BarChart3,
  MessageSquare,
  Smartphone,
  Shield,
  GraduationCap,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Admin Dashboard",
      description:
        "Manage staff, parents, and students with full editing capabilities and comprehensive oversight.",
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Personalized Schedules",
      description:
        "Students and teachers receive real-time schedule calendars based on the school timetable.",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Attendance Analytics",
      description:
        "Teachers can take attendance and access real-time analytics on attendance rates.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Parent Portal",
      description:
        "Parents can conveniently view the schedules of all their children in one place.",
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "School-Wide Communication",
      description:
        "Share important announcements and events school-wide to keep everyone informed.",
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "PWA Support",
      description:
        "Install the app on any device for quick and easy access anywhere, anytime.",
    },
  ];

  const technologies = [
    {
      name: "Next.js",
      description: "React framework for building performant web applications",
    },
    {
      name: "TypeScript",
      description: "Superset of JavaScript for enhanced type safety",
    },
    {
      name: "Tailwind CSS",
      description: "Utility-first CSS framework for rapid UI development",
    },
    { name: "Prisma", description: "Modern database toolkit & ORM" },
    { name: "JWT", description: "Secure authentication using tokens" },
    {
      name: "Nodemailer",
      description: "Automated email services for school communication",
    },
    {
      name: "Framer Motion",
      description: "Smooth animations and intuitive transitions",
    },
    {
      name: "React Hook Form",
      description: "Efficient form handling and validation",
    },
    { name: "Zod", description: "Strict schema validation for data integrity" },
    { name: "Zustand", description: "Lightweight state management" },
  ];

  const stats = [
    { number: "Fast", label: "Response Time" },
    { number: "PWA", label: "Enabled" },
    { number: "4", label: "User Roles" },
    { number: "10+", label: "Features" },
  ];

  return (
    <div className="min-h-screen bg-primary text-white">
      {/* Header */}
      <header className="border-b border-gray-900 bg-black/80 backdrop-blur fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="text-xl font-bold">EduStream</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#tech"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Technology
            </Link>
            <Button className="bg-secondary text-primary">
              <Link href="/login">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 mt-20">
        <div className="container mx-auto text-center">
          <Badge
            variant="secondary"
            className="mb-4 bg-gray-900/50 text-gray-300 border-gray-800"
          >
            🎓 Final Year Project - School Management System
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-300 to-gray-600 bg-clip-text text-transparent">
            EduStream
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            A comprehensive, modern solution for school administration and communication. 
            Bridging the gap between admins, teachers, parents, and students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-secondary text-primary w-full sm:w-auto">
                Launch System
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800 w-full sm:w-auto"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y border-gray-800 bg-black/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-secondary-light mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Unified Management</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience a streamlined workflow with real-time data synchronization 
              and a responsive, mobile-first design.
            </p>
          </div>
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl"></div>
            <div className="relative bg-gray-900 rounded-lg border border-gray-800 overflow-hidden shadow-2xl">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20%28173%29%20-%20Copy-ENsqvLtMcx0k23fOt5uCloe9A2oEa5.png"
                alt="EduStream Dashboard Preview"
                width={1200}
                height={800}
                className="w-full h-auto opacity-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">✨ Key Modules</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built with scalability in mind, offering specialized tools for every role.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="text-secondary-light mb-2">{feature.icon}</div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="tech" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              💻 Technical Architecture
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Leveraging modern web technologies for a robust and secure foundation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <CheckCircle className="h-6 w-6 text-secondary-light mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-1">{tech.name}</h3>
                  <p className="text-gray-400 text-sm">{tech.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary to-black">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-400 mb-8">
              Experience the future of school administration today.
            </p>
            <div className="flex justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-secondary text-primary px-10">
                  Login to Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 bg-black">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <GraduationCap className="h-6 w-6" />
              <span className="font-semibold">EduStream</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} EduStream - Final Year Project. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
