import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { subDays, startOfDay, endOfDay, format, differenceInDays, addDays } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7d";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    let startDate: Date;
    let endDate: Date = endOfDay(new Date());

    if (period === "custom" && customStart && customEnd) {
      startDate = startOfDay(new Date(customStart));
      endDate = endOfDay(new Date(customEnd));
    } else {
      let days = 7;
      if (period === "30d") days = 30;
      if (period === "90d") days = 90;
      startDate = subDays(startOfDay(new Date()), days);
    }

    // Get transactions in the period
    const transactions = await prisma.transaction.findMany({
      where: {
        borrowDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { borrowDate: "asc" },
    });

    // Group by day for the chart
    const statsMap: Record<string, number> = {};
    const diffDays = differenceInDays(endDate, startDate);
    
    // Limit to avoid too many bars (max 90 labels)
    const step = diffDays > 30 ? Math.ceil(diffDays / 15) : 1;

    for (let i = 0; i <= diffDays; i++) {
      const d = addDays(startDate, i);
      const key = format(d, "dd MMM");
      statsMap[key] = 0;
    }

    transactions.forEach((t) => {
      const key = format(new Date(t.borrowDate), "dd MMM");
      if (statsMap[key] !== undefined) {
        statsMap[key]++;
      }
    });

    const chartData = Object.entries(statsMap).map(([name, count]) => ({
      name,
      count,
    }));

    // General summary (still overall for context, or should it be filtered?)
    // Usually summary cards are overall status, but "Total Pinjam" should be filtered.
    const filteredTotal = transactions.length;
    
    const activeBorrowed = await prisma.transaction.count({
      where: { status: "APPROVED" },
    });
    const totalLaptops = await prisma.laptop.count();
    const maintenanceCount = await prisma.laptop.count({
      where: { status: "MAINTENANCE" },
    });

    return NextResponse.json({
      chartData,
      summary: {
        totalBorrowed: filteredTotal, // Show filtered count in the card
        activeBorrowed,
        availableLaptops: totalLaptops - activeBorrowed - maintenanceCount,
        maintenanceCount,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
