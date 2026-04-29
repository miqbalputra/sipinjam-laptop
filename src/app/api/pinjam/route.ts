import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { generateActionToken } from "@/app/api/action/route";

export async function POST(request: Request) {
  try {
    const { teacherId, laptopId, purpose } = await request.json();

    if (!teacherId || !laptopId) {
      return NextResponse.json(
        { message: "Data tidak lengkap." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const laptop = await tx.laptop.findUnique({
        where: { id: laptopId },
      });

      if (!laptop || laptop.status !== "AVAILABLE") {
        throw new Error("Laptop tidak lagi tersedia.");
      }

      const transaction = await tx.transaction.create({
        data: {
          teacherId,
          laptopId,
          status: "PENDING",
        },
        include: {
          teacher: true,
          laptop: true,
        },
      });

      return transaction;
    });

    // Kirim Webhook ke n8n
    try {
      const settings = await prisma.setting.findMany();
      const settingsObj = settings.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      if (settingsObj.n8n_webhook_url) {
        const adminPhones = [
          settingsObj.admin_phone_1,
          settingsObj.admin_phone_2,
          settingsObj.admin_phone_3,
        ].filter(Boolean);

        const baseUrl = process.env.NEXTAUTH_URL || "https://laptop.griyaquran.web.id";
        const approveToken = generateActionToken(result.id, "approve");
        const rejectToken = generateActionToken(result.id, "reject");

        await axios.post(settingsObj.n8n_webhook_url, {
          type: "NEW_REQUEST",
          transactionId: result.id,
          teacherName: result.teacher.name,
          teacherPhone: result.teacher.phone,
          laptopMerk: result.laptop.merk,
          purpose: purpose,
          adminPhones: adminPhones,
          approveUrl: `${baseUrl}/api/action?token=${approveToken}`,
          rejectUrl: `${baseUrl}/api/action?token=${rejectToken}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (webhookError) {
      console.error("Webhook Error:", webhookError);
    }

    return NextResponse.json({ success: true, transactionId: result.id });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan sistem." },
      { status: 500 }
    );
  }
}
