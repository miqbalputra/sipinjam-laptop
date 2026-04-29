import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const transactions = await prisma.transaction.findMany({
      include: {
        teacher: true,
        laptop: true,
      },
      orderBy: { borrowDate: "desc" },
    });

    // Prepare data for Excel
    const data = transactions.map((t) => ({
      ID: t.id,
      "Nama Guru": t.teacher.name,
      Divisi: t.teacher.division,
      "No. HP": t.teacher.phone,
      Laptop: t.laptop.merk,
      "Serial Number": t.laptop.serialNumber,
      Status: t.status,
      "Tanggal Pinjam": new Date(t.borrowDate).toLocaleString("id-ID"),
      "Tanggal Kembali": t.returnDate ? new Date(t.returnDate).toLocaleString("id-ID") : "-",
    }));

    // Create workbook and sheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Peminjaman");

    // Generate buffer
    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="laporan_peminjaman.xlsx"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
