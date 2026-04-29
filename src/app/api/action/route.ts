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

// ─── GET: Approve langsung / Reject tampilkan form ───────────────────────────
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
    return new Response(
      renderPage("⏰ Link Kadaluarsa", "Link sudah tidak valid atau telah digunakan. Silakan login ke dashboard admin.", "orange"),
      { headers: { "Content-Type": "text/html" }, status: 400 }
    );
  }

  const { transactionId, action } = verified;

  const existing = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { teacher: true, laptop: true },
  });

  if (!existing) {
    return new Response(renderPage("❌ Tidak Ditemukan", "Data transaksi tidak ditemukan.", "red"), {
      headers: { "Content-Type": "text/html" }, status: 404,
    });
  }

  if (existing.status !== "PENDING") {
    return new Response(
      renderPage("ℹ️ Sudah Diproses", `Pengajuan dari ${existing.teacher.name} untuk laptop ${existing.laptop.merk} sudah berstatus: ${existing.status}`, "blue"),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // REJECT → tampilkan halaman konfirmasi dengan form alasan
  if (action === "reject") {
    return new Response(renderRejectForm(token, existing.teacher.name, existing.laptop.merk), {
      headers: { "Content-Type": "text/html" },
    });
  }

  // APPROVE → langsung proses
  return await processAction(transactionId, "approve", "", existing);
}

// ─── POST: Proses reject dari form konfirmasi ─────────────────────────────────
export async function POST(request: Request) {
  const formData = await request.formData();
  const token = formData.get("token") as string;
  const rejectReason = (formData.get("reason") as string)?.trim() || "Tidak ada alasan diberikan";

  if (!token) {
    return new Response(renderPage("❌ Token Tidak Valid", "Silakan gunakan link dari WhatsApp.", "red"), {
      headers: { "Content-Type": "text/html" }, status: 400,
    });
  }

  const verified = verifyActionToken(token);
  if (!verified) {
    return new Response(
      renderPage("⏰ Link Kadaluarsa", "Link sudah tidak valid. Silakan login ke dashboard admin.", "orange"),
      { headers: { "Content-Type": "text/html" }, status: 400 }
    );
  }

  const existing = await prisma.transaction.findUnique({
    where: { id: verified.transactionId },
    include: { teacher: true, laptop: true },
  });

  if (!existing || existing.status !== "PENDING") {
    return new Response(
      renderPage("ℹ️ Sudah Diproses", "Transaksi ini sudah diproses sebelumnya.", "blue"),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return await processAction(verified.transactionId, "reject", rejectReason, existing);
}

// ─── Helper: Proses approve/reject ───────────────────────────────────────────
async function processAction(
  transactionId: string,
  action: "approve" | "reject",
  rejectReason: string,
  existing: any
) {
  try {
    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: newStatus,
        ...(action === "reject" && { rejectReason }),
      },
    });

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
          rejectReason: action === "reject" ? rejectReason : null,
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
          ? `Peminjaman laptop ${existing.laptop.merk} oleh ${existing.teacher.name} telah DISETUJUI.\nNotifikasi WhatsApp telah dikirim ke guru.`
          : `Peminjaman laptop ${existing.laptop.merk} oleh ${existing.teacher.name} telah DITOLAK.\nAlasan: ${rejectReason}\n\nNotifikasi WhatsApp telah dikirim ke guru.`,
        isApproved ? "green" : "red"
      ),
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    return new Response(renderPage("❌ Error", "Terjadi kesalahan sistem.", "red"), {
      headers: { "Content-Type": "text/html" }, status: 500,
    });
  }
}

// ─── HTML Templates ───────────────────────────────────────────────────────────
function renderRejectForm(token: string, teacherName: string, laptopMerk: string) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Penolakan - SiPinjam</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #f3f4f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: white; border: 4px solid black; box-shadow: 8px 8px 0 black; border-radius: 8px; padding: 36px; max-width: 480px; width: 100%; }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
    .icon { width: 52px; height: 52px; background: #fef2f2; border: 3px solid black; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
    h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
    .subtitle { font-size: 13px; color: #6b7280; font-weight: 600; margin-top: 2px; }
    .info-box { background: #fef9c3; border: 2px solid black; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px; }
    .info-box p { font-size: 13px; font-weight: 700; color: #374151; line-height: 1.6; }
    .info-box span { color: #000; }
    label { display: block; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; color: #111; }
    textarea { width: 100%; border: 3px solid black; border-radius: 6px; padding: 12px 14px; font-size: 14px; font-family: inherit; resize: vertical; min-height: 100px; box-shadow: 3px 3px 0 black; outline: none; transition: box-shadow 0.15s; }
    textarea:focus { box-shadow: 5px 5px 0 black; }
    .shortcuts { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 20px; }
    .chip { background: #f3f4f6; border: 2px solid #d1d5db; border-radius: 4px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.1s; }
    .chip:hover { background: #fef2f2; border-color: #ef4444; color: #ef4444; }
    .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .btn { padding: 14px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border: 3px solid black; cursor: pointer; transition: all 0.15s; font-family: inherit; }
    .btn-cancel { background: white; color: black; box-shadow: 3px 3px 0 black; }
    .btn-cancel:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 black; }
    .btn-cancel:active { transform: translate(2px, 2px); box-shadow: none; }
    .btn-reject { background: #ef4444; color: white; box-shadow: 3px 3px 0 black; }
    .btn-reject:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 black; }
    .btn-reject:active { transform: translate(2px, 2px); box-shadow: none; }
    .brand { margin-top: 24px; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 2px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="icon">❌</div>
      <div>
        <h1>Konfirmasi Penolakan</h1>
        <div class="subtitle">Berikan alasan agar guru dapat memahami</div>
      </div>
    </div>

    <div class="info-box">
      <p>👤 Peminjam: <span>${teacherName}</span></p>
      <p>💻 Laptop: <span>${laptopMerk}</span></p>
    </div>

    <form method="POST" action="/api/action">
      <input type="hidden" name="token" value="${token}">
      <label for="reason">Alasan Penolakan</label>
      <textarea id="reason" name="reason" placeholder="Contoh: Laptop sedang dalam perbaikan..." required></textarea>

      <div class="shortcuts">
        <div class="chip" onclick="setReason('Laptop sedang dalam perbaikan')">🔧 Sedang diperbaiki</div>
        <div class="chip" onclick="setReason('Laptop sudah dipinjam orang lain')">👥 Sudah dipinjam</div>
        <div class="chip" onclick="setReason('Stok laptop tidak mencukupi')">📦 Stok habis</div>
        <div class="chip" onclick="setReason('Keperluan tidak sesuai kebijakan')">📋 Tidak sesuai kebijakan</div>
      </div>

      <div class="actions">
        <button type="button" class="btn btn-cancel" onclick="history.back()">← Batalkan</button>
        <button type="submit" class="btn btn-reject">Konfirmasi ❌</button>
      </div>
    </form>

    <div class="brand">SiPinjam Laptop • Griya Quran</div>
  </div>
  <script>
    function setReason(text) {
      document.getElementById('reason').value = text;
      document.getElementById('reason').focus();
    }
  </script>
</body>
</html>`;
}

function renderPage(title: string, message: string, color: string) {
  const colors: Record<string, string> = {
    green: "#22c55e", red: "#ef4444", orange: "#f97316", blue: "#3b82f6",
  };
  const bg = colors[color] || "#6b7280";
  const emoji = title.split(" ")[0];
  const titleText = title.split(" ").slice(1).join(" ");
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleText} - SiPinjam</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #f3f4f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: white; border: 4px solid black; box-shadow: 8px 8px 0 black; border-radius: 8px; padding: 40px; max-width: 440px; width: 100%; text-align: center; }
    .icon { width: 80px; height: 80px; border-radius: 50%; background: ${bg}22; border: 4px solid ${bg}; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 36px; }
    h1 { font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 12px; }
    p { color: #4b5563; font-weight: 600; font-size: 14px; line-height: 1.8; white-space: pre-line; margin-bottom: 28px; }
    a { display: inline-block; background: black; color: white; padding: 14px 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 11px; text-decoration: none; border: 3px solid black; box-shadow: 4px 4px 0 #374151; }
    a:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #374151; }
    .brand { margin-top: 32px; padding-top: 16px; border-top: 2px solid #e5e7eb; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 2px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${emoji}</div>
    <h1>${titleText}</h1>
    <p>${message}</p>
    <a href="/admin">Buka Dashboard Admin</a>
    <div class="brand">SiPinjam Laptop • Griya Quran</div>
  </div>
</body>
</html>`;
}
