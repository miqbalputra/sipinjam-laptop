import { prisma } from "@/lib/prisma";
import TransactionManager from "./TransactionManager";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    include: {
      teacher: true,
      laptop: true,
    },
    orderBy: { borrowDate: "desc" },
  });

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-black tracking-tight mb-2">RIWAYAT & PERSETUJUAN</h1>
        <p className="text-zinc-500">Kelola permintaan peminjaman dan pantau pengembalian unit.</p>
      </header>

      <TransactionManager initialTransactions={transactions} />
    </div>
  );
}
