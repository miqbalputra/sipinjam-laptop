import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    // Ambil PIN dari database
    let globalPin = await prisma.setting.findUnique({
      where: { key: "global_pin" },
    });

    // Jika belum ada di DB, set default (untuk dev)
    if (!globalPin) {
      globalPin = await prisma.setting.create({
        data: { key: "global_pin", value: "123456" },
      });
    }

    if (pin === globalPin.value) {
      const response = NextResponse.json({ success: true });

      // Set cookie PIN_AUTH, berlaku selama 12 jam (sesuai PRD)
      response.cookies.set("PIN_AUTH", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 12 * 60 * 60, // 12 jam
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "PIN yang Anda masukkan salah." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
