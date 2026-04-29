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
