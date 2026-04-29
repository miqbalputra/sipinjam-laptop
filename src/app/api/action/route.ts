import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import axios from "axios";

const SECRET = process.env.NEXTAUTH_SECRET || "sipinjam-secret";

// Generate token: HMAC dari transactionId + action + expiry
export function generateActionToken(transactionId: string, action: "approve" | "reject") {
  const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 jam
  const payload = `${transactionId}:${action}:${expiry}`;
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${signature}`).toString("base64url");
  return token;
}

// Verify dan decode token
function verifyActionToken(token: string): { transactionId: string; action: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return null;

    const [transactionId, action, expiry, signature] = parts;

    // Cek expiry
    if (Date.now() > parseInt(expiry)) return null;

    // Verifikasi signature
    const payload = `${transactionId}:${action}:${expiry}`;
    const expectedSig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    if (signature !== expectedSig) return null;

    return { transactionId, action };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response(renderPage("❌ Link Tidak Valid", "Token tidak ditemukan.", "red"), {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  const verified = verifyActionToken(token);
  if (!verified) {
    return new Response(renderPage("⏰ Link Kadaluarsa", "Link sudah tidak valid atau sudah digunakan. Silakan login ke dashboard admin.", "orange"), {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  const { transactionId, action } = verified;

  try {
    // Cek apakah transaksi masih PENDING
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { teacher: true, laptop: true },
    });

    if (!existing) {
      return new Response(renderPage("❌ Tidak Ditemukan", "Data transaksi tidak ditemukan.", "red"), {
        headers: { "Content-Type": "text/html" },
        status: 404,
      });
    }

    if (existing.status !== "PENDING") {
      return new Response(
        renderPage(
          "ℹ️ Sudah Diproses",
          `Pengajuan dari ${existing.teacher.name} untuk laptop ${existing.laptop.merk} sudah berstatus: ${existing.status}`,
          "blue"
        ),
        { headers: { "Content-Type": "text/html" } }
      );
    }

    // Update status
    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: newStatus },
    });

    // Update laptop status jika disetujui
    if (action === "approve") {
      await prisma.laptop.update({
        where: { id: existing.laptopId },
        data: { status: "BORROWED" },
      });
    }

    // Kirim notifikasi WA ke guru via n8n
    try {
      const settings = await prisma.setting.findMany();
      const settingsObj = settings.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      if (settingsObj.n8n_webhook_url) {
        await axios.post(settingsObj.n8n_webhook_url, {
          type: "STATUS_UPDATE",
          action,
          teacherName: existing.teacher.name,
          teacherPhone: existing.teacher.phone,
          laptopMerk: existing.laptop.merk,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (webhookError) {
      console.error("Webhook Error:", webhookError);
    }

    const isApproved = action === "approve";
    return new Response(
      renderPage(
        isApproved ? "✅ Disetujui!" : "❌ Ditolak",
        isApproved
          ? `Peminjaman laptop ${existing.laptop.merk} oleh ${existing.teacher.name} telah DISETUJUI. Notifikasi WA telah dikirim ke guru.`
          : `Peminjaman laptop ${existing.laptop.merk} oleh ${existing.teacher.name} telah DITOLAK. Notifikasi WA telah dikirim ke guru.`,
        isApproved ? "green" : "red"
      ),
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    return new Response(renderPage("❌ Error", "Terjadi kesalahan sistem.", "red"), {
      headers: { "Content-Type": "text/html" },
      status: 500,
    });
  }
}

function renderPage(title: string, message: string, color: string) {
  const colors: Record<string, string> = {
    green: "#22c55e", red: "#ef4444", orange: "#f97316", blue: "#3b82f6",
  };
  const bg = colors[color] || "#6b7280";
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - SiPinjam</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #f3f4f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: white; border: 4px solid black; box-shadow: 6px 6px 0 black; border-radius: 8px; padding: 40px; max-width: 440px; width: 100%; text-align: center; }
    .icon { width: 72px; height: 72px; border-radius: 50%; background: ${bg}; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 32px; border: 3px solid black; }
    h1 { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 12px; }
    p { color: #4b5563; font-weight: 600; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    a { display: inline-block; background: black; color: white; padding: 12px 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 11px; text-decoration: none; border: 2px solid black; box-shadow: 3px 3px 0 #374151; }
    .brand { margin-top: 32px; padding-top: 16px; border-top: 2px solid #e5e7eb; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 2px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${title.split(' ')[0]}</div>
    <h1>${title.split(' ').slice(1).join(' ')}</h1>
    <p>${message}</p>
    <a href="/admin">Buka Dashboard Admin</a>
    <div class="brand">SiPinjam Laptop • Griya Quran</div>
  </div>
</body>
</html>`;
}
