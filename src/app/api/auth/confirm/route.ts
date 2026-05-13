import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import crypto from "crypto";
import { getRoleLabel } from "@/lib/helpers";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ status: 400, message: "Invalid token" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(), // Ensure token is not expired
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        status: 400,
        message: "Invalid or expired token",
      });
    }

    // Hash the password and clear the token
    const hashedPassword = await bcrypt.hash(user.tempPassword as string, 10);
    await prisma.user.update({
      where: { email: user.email },
      data: {
        password: hashedPassword,
        tempPassword: null,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

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
      { expiresIn: "4W" }
    );

    // Set the token in an HTTP-only cookie
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
      maxAge: 7 * 24 * 60 * 60, // 1 week
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

    return NextResponse.redirect(
      `${process.env.BASE_URL}/${getRoleLabel(user.role)}`
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
};
