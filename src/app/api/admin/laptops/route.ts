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
    
    const laptop = await prisma.laptop.create({
      data: {
        merk: data.merk,
        serialNumber: data.serialNumber,
        color: data.color,
        fundingSource: data.fundingSource,
        status: data.status,
        imageUrl: data.imageUrl || null,
      },
    });

    return NextResponse.json(laptop);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await checkAuth();
    const { id, ...data } = await request.json();
    
    const laptop = await prisma.laptop.update({
      where: { id },
      data,
    });

    return NextResponse.json(laptop);
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

    // Cek apakah laptop sedang dipinjam
    const laptop = await prisma.laptop.findUnique({ where: { id } });
    if (laptop?.status === "BORROWED") {
      throw new Error("Tidak dapat menghapus laptop yang sedang dipinjam.");
    }

    await prisma.laptop.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
