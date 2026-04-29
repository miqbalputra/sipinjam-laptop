import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();

    // 1. Ambil data admin
    const admin = await prisma.admin.findUnique({
      where: { username: session.user?.name as string },
    });

    if (!admin) return NextResponse.json({ message: "Admin not found" }, { status: 404 });

    // 2. Cek password lama
    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) return NextResponse.json({ message: "Password saat ini salah." }, { status: 400 });

    // 3. Hash password baru dan simpan
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
