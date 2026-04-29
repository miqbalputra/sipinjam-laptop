import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { username, currentPassword, newPassword } = await request.json();

    const admin = await prisma.admin.findUnique({
      where: { username: session.user?.name || "admin" },
    });

    if (!admin) return NextResponse.json({ message: "Admin not found" }, { status: 404 });

    // Verify current password if changing password or username
    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      return NextResponse.json({ message: "Password saat ini salah!" }, { status: 400 });
    }

    const updateData: any = {};
    if (username && username !== admin.username) {
      updateData.username = username;
    }
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.admin.update({
        where: { id: admin.id },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
