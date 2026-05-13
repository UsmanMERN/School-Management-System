import { prisma } from "@/lib/prisma";
import { withAuthRoute } from "@/lib/routeauth";
import { NextResponse } from "next/server";
import { Gender } from "@prisma/client";

function getDayRange(date: Date): { gte: Date; lt: Date } {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfNextDay = new Date(startOfDay);
  startOfNextDay.setDate(startOfDay.getDate() + 1);
  return { gte: startOfDay, lt: startOfNextDay };
}

export const GET = withAuthRoute(async (req: Request, user) => {
  try {
    if (user.role !== "TEACHER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Find the class where this teacher is the classTeacher
    const teacherClass = await prisma.class.findFirst({
      where: {
        schoolId: user.schoolId,
        classTeacher: user.name,
      },
    });

    if (!teacherClass) {
      return NextResponse.json(
        { students: [], total: 0, page, totalPages: 1, attendanceMarked: false },
        { status: 200 }
      );
    }

    // Get today's attendance for this class
    const today = new Date();
    const { gte, lt } = getDayRange(today);

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        classId: teacherClass.id,
        date: { gte, lt },
      },
      select: {
        id: true,
        studentId: true,
        status: true,
      },
    });

    // Fetch students in this class

    const isValidGender = ["MALE", "FEMALE"].includes(search.toUpperCase());

    const students = await prisma.student.findMany({
      where: {
        schoolId: user.schoolId,
        class: teacherClass.name,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
            { parentName: { contains: search, mode: "insensitive" } },
            ...(isValidGender
              ? [{ gender: { equals: search.toUpperCase() as Gender } }]
              : []),
          ],
        }),
      },
      skip,
      take: limit,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        class: true,
      },
    });

    const total = await prisma.student.count({
      where: {
        schoolId: user.schoolId,
        class: teacherClass.name,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
            { parentName: { contains: search, mode: "insensitive" } },
            ...(isValidGender
              ? [{ gender: { equals: search.toUpperCase() as Gender } }]
              : []),
          ],
        }),
      },
    });

    // If attendance already marked for all students, return attendance status
    const attendanceMap = Object.fromEntries(
      attendanceRecords.map((a) => [a.studentId, a.status])
    );
    const attendanceMarked = attendanceRecords.length === students.length;

    return NextResponse.json(
      {
        students,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        attendanceMarked,
        attendance: attendanceMap,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching attendance students:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
});

export const POST = withAuthRoute(async (req: Request, user) => {
  try {
    if (user.role !== "TEACHER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { data } = await req.json();
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ message: "No attendance data provided" }, { status: 400 });
    }

    // Find the class for this teacher
    const teacherClass = await prisma.class.findFirst({
      where: {
        schoolId: user.schoolId,
        classTeacher: user.name,
      },
    });

    if (!teacherClass) {
      return NextResponse.json({ message: "No class found for teacher" }, { status: 400 });
    }

    // Get today's attendance records for this class
    const today = new Date();
    const { gte, lt } = getDayRange(today);

    const existingRecords = await prisma.attendance.findMany({
      where: {
        classId: teacherClass.id,
        date: { gte, lt },
      },
    });

    // If attendance already exists, update or create as needed
    if (existingRecords.length > 0) {
      // Map existing records by studentId for quick lookup
      const existingMap = Object.fromEntries(
        existingRecords.map((rec) => [rec.studentId, rec])
      );

      // Prepare update and create operations
      const updateOps = [];
      const createOps = [];

      for (const item of data) {
        if (existingMap[item.studentId]) {
          // Update if status is different
          if (existingMap[item.studentId].status !== item.status) {
            updateOps.push(
              prisma.attendance.update({
                where: { id: existingMap[item.studentId].id },
                data: { status: item.status },
              })
            );
          }
        } else {
          // Create new record for latecomers
          createOps.push(
            prisma.attendance.create({
              data: {
                date: today,
                schoolId: user.schoolId,
                studentId: item.studentId,
                classId: teacherClass.id,
                status: item.status,
              },
            })
          );
        }
      }

      await Promise.all([...updateOps, ...createOps]);
      return NextResponse.json({ message: "Attendance updated" }, { status: 200 });
    }

    // If no attendance exists, create all
    await prisma.attendance.createMany({
      data: data.map((item: { studentId: string; status: "PRESENT" | "ABSENT" }) => ({
        date: today,
        schoolId: user.schoolId,
        studentId: item.studentId,
        classId: teacherClass.id,
        status: item.status,
      })),
    });

    return NextResponse.json({ message: "Attendance submitted" }, { status: 200 });
  } catch (error) {
    console.error("Error submitting attendance:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
});

export const PATCH = withAuthRoute(async (req: Request, user) => {
  try {
    if (user.role !== "TEACHER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ message: "Id and status required" }, { status: 400 });
    }

    const attendance = await prisma.attendance.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(attendance, { status: 200 });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuthRoute(async (req: Request, user) => {
  try {
    if (user.role !== "TEACHER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "Id required" }, { status: 400 });
    }

    await prisma.attendance.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Attendance deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
});