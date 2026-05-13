import { prisma } from "@/lib/prisma";
import { withAuthRoute } from "@/lib/routeauth";
import { Gender } from "@prisma/client";

import { NextResponse } from "next/server";
import { v4 } from "uuid";

export const GET = withAuthRoute(async (req: Request, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const order = (searchParams.get("sort") as "asc" | "desc") || "asc";
    const skip = (page - 1) * limit;

    const isValidGender = ["MALE", "FEMALE"].includes(search.toUpperCase());

    const students = await prisma.student.findMany({
      where: {
        schoolId: user.schoolId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
            { class: { contains: search, mode: "insensitive" } },
            { parentName: { contains: search, mode: "insensitive" } },
            { birthdate: { contains: search, mode: "insensitive" } },
            ...(isValidGender
              ? [{ gender: { equals: search.toUpperCase() as Gender } }]
              : []),
            { DOA: { contains: search, mode: "insensitive" } },
            { parentNo: { contains: search, mode: "insensitive" } },
            { admissionNo: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      skip,
      take: limit,
      orderBy: { name: order },
    });

    const total = await prisma.student.count({
      where: {
        schoolId: user.schoolId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
            { class: { contains: search, mode: "insensitive" } },
            { parentName: { contains: search, mode: "insensitive" } },
            { birthdate: { contains: search, mode: "insensitive" } },
            ...(isValidGender
              ? [{ gender: { equals: search.toUpperCase() as Gender } }]
              : []),
            { DOA: { contains: search, mode: "insensitive" } },
            { parentNo: { contains: search, mode: "insensitive" } },
            { admissionNo: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
    });

    return NextResponse.json(
      {
        students,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
});

export const POST = withAuthRoute(async (req: Request, user) => {
  try {
    const {
      totalData: { parentEmail, ...data },
      type,
      id,
    } = await req.json();

    if (!data) {
      return NextResponse.json({ error: "Data are required" }, { status: 400 });
    }

    let parentId = v4();

    const newId = v4();

    type === "create" ? await prisma.user.create({
      data: {
        id: newId,
        name: data.name,
        email: data.email,
        schoolId: user.schoolId,
        role: "STUDENT",
      },
    }) : await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        schoolId: user.schoolId,
        role: "STUDENT",
      },
    });

    const existingParent =
      type === "create"
        ? await prisma.parent.findUnique({
            where: {
              email: parentEmail,
            },
          })
        : null;

    if (existingParent) {
      parentId = existingParent.id;
    } else {
      type === "create" &&
        (await prisma.parent.create({
          data: {
            id: parentId,
            name: data.parentName,
            email: parentEmail,
            address: data.address,
            phoneNo: data.parentNo,
            schoolId: user.schoolId,
          },
        }));
    }

    type === "create"
      ? await prisma.student.create({
          data: {
            id: newId,
            ...data,
            parentId,
            schoolId: user.schoolId,
          },
        })
      : await prisma.student.update({
          where: { id },
          data: {
            ...data,
            schoolId: user.schoolId,
          },
        });

    return NextResponse.json(
      { message: `Student ${type}d successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating/creating student:", error);
    return NextResponse.json(
      { error: "Failed to update/create student" },
      { status: 500 }
    );
  }
});

export const PATCH = withAuthRoute(async (req: Request, user) => {
  try {
    const { id, data } = await req.json();

    if (!id || !data) {
      return NextResponse.json(
        { error: "Id and data are required" },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        ...data,
        schoolId: user.schoolId,
      },
    });

    return NextResponse.json(staff, { status: 200 });
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { error: "Failed to update staff" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuthRoute(async (req: Request, user) => {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "Id not provided" }, { status: 404 });
    }

    await prisma.student.delete({
      where: {
        id,
      },
    });

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: "Delete successfull" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
});
