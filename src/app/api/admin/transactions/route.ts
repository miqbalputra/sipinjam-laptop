import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from "axios";

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
}

export async function PUT(request: Request) {
  try {
    await checkAuth();
    const { id, action } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: { laptop: true },
      });

      if (!transaction) throw new Error("Transaksi tidak ditemukan.");

      let newStatus = transaction.status;
      let laptopStatus = transaction.laptop.status;

      if (action === "approve") {
        newStatus = "APPROVED";
        laptopStatus = "BORROWED";
      } else if (action === "reject") {
        newStatus = "REJECTED";
        laptopStatus = "AVAILABLE";
      } else if (action === "return") {
        newStatus = "RETURNED";
        laptopStatus = "AVAILABLE";
      }

      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: { 
          status: newStatus,
          returnDate: action === "return" ? new Date() : null,
        },
      });

      await tx.laptop.update({
        where: { id: transaction.laptopId },
        data: { status: laptopStatus },
      });

      return updatedTransaction;
    });

    // Kirim Notifikasi ke n8n (WhatsApp)
    try {
      const settings = await prisma.setting.findMany();
      const settingsObj = settings.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      if (settingsObj.n8n_webhook_url) {
        const detail = await prisma.transaction.findUnique({
          where: { id: result.id },
          include: { teacher: true, laptop: true }
        });

        if (detail) {
          await axios.post(settingsObj.n8n_webhook_url, {
            type: "STATUS_UPDATE",
            action,
            transactionId: detail.id,
            teacherName: detail.teacher.name,
            teacherPhone: detail.teacher.phone,
            laptopMerk: detail.laptop.merk,
            status: detail.status,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (webhookError) {
      console.error("Webhook Error:", webhookError);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await checkAuth();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json({ message: "Parameter 'from' dan 'to' diperlukan." }, { status: 400 });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999); // sampai akhir hari

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json({ message: "Format tanggal tidak valid." }, { status: 400 });
    }

    // Cari transaksi APPROVED yang laptop-nya perlu direset
    const approvedTx = await prisma.transaction.findMany({
      where: { borrowDate: { gte: fromDate, lte: toDate }, status: "APPROVED" },
      select: { laptopId: true },
    });

    if (approvedTx.length > 0) {
      await prisma.laptop.updateMany({
        where: { id: { in: approvedTx.map(t => t.laptopId) } },
        data: { status: "AVAILABLE" },
      });
    }

    // Hapus semua transaksi dalam periode
    const result = await prisma.transaction.deleteMany({
      where: { borrowDate: { gte: fromDate, lte: toDate } },
    });

    return NextResponse.json({ deleted: result.count });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

