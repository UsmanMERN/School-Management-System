import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const POST = async (req: Request) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Fetch user from the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 404 }
      );
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      if (user.password === "") {
        return NextResponse.json({ error: "PNS" }, { status: 401 });
      }
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT
    const accesstoken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15M" }
    );

    // Generate refresh token
    const refreshtoken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1W" }
    );

    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    });

    const cookiesStore = await cookies();

    // Set the cookie with the token

    cookiesStore.set("accesstoken", accesstoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 mins
    });

    cookiesStore.set("refreshtoken", refreshtoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 1 W
    });

    const headersList = await headers();

    const forwardedFor = headersList.get("x-forwarded-for");
    let ipAddress =
      forwardedFor?.split(",")[0].trim() ||
      headersList.get("x-vercel-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "Unknown";

    console.log("Detected IP Address:", ipAddress || "Could not determine IP");
    const userAgent = headersList.get("user-agent") || "Unknown";
    console.log("Detected User Agent:", userAgent);

    await prisma.refreshTokens.create({
      data: {
        userId: user.id,
        deviceInfo: userAgent,
        ipAddress: ipAddress,
        tokenHash: crypto
          .createHash("sha256")
          .update(refreshtoken)
          .digest("hex"),
        expiresOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now()),
      },
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
