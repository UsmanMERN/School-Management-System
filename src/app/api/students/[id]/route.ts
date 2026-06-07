import { prisma } from "@/lib/prisma";
import { withAuthRoute } from "@/lib/routeauth";
import { NextResponse } from "next/server";

export const GET = withAuthRoute(async (req: Request, user) => {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: id !== "self" ? id : user.id, schoolId: user.schoolId },
      include: { parent: true },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(student, { status: 200 });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
});
