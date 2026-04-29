import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
}

export async function POST(request: Request) {
  try {
    await checkAuth();
    const data = await request.json();
    
    const teacher = await prisma.teacher.create({
      data: {
        name: data.name,
        gender: data.gender,
        division: data.division,
        phone: data.phone,
      },
    });

    return NextResponse.json(teacher);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await checkAuth();
    const { id, ...data } = await request.json();
    
    const teacher = await prisma.teacher.update({
      where: { id },
      data,
    });

    return NextResponse.json(teacher);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await checkAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) throw new Error("ID required");

    // Soft delete atau hard delete? PRD menyebut "Fitur Soft Delete jika guru mutasi atau resign"
    const teacher = await prisma.teacher.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(teacher);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}
