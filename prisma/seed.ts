import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

// Prisma 7 Adapter setup
const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ 
  url: `file:${dbPath}` 
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding started...");

  // 1. Clean Data
  try {
    await prisma.transaction.deleteMany();
    await prisma.laptop.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.setting.deleteMany();
    console.log("Existing data cleared.");
  } catch (err) {
    console.log("Error cleaning data (might be empty):", err);
  }

  // 2. Admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.admin.create({
    data: {
      username: "admin",
      password: hashedPassword,
    },
  });

  // 3. Settings
  await prisma.setting.createMany({
    data: [
      { key: "global_pin", value: "123456" },
      { key: "n8n_webhook_url", value: "" },
    ],
  });

  // 4. Teachers
  await prisma.teacher.createMany({
    data: [
      { name: "BUDI SANTOSO", gender: "L", division: "SMP / IT", phone: "628123456789", isActive: true },
      { name: "SITI AMINAH", gender: "P", division: "SMA / BAHASA", phone: "628123456780", isActive: true },
      { name: "AHMAD DHANI", gender: "L", division: "SD / MATEMATIKA", phone: "628123456781", isActive: true },
      { name: "DEWI SARTIKA", gender: "P", division: "SMP / IPA", phone: "628123456782", isActive: true },
    ],
  });

  // 5. Laptops with Brand Logos
  await prisma.laptop.createMany({
    data: [
      {
        merk: "Lenovo ThinkPad X1 Carbon",
        serialNumber: "LEN-778899",
        color: "Black",
        fundingSource: "BOS 2023",
        status: "AVAILABLE",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lenovo_logo_2015.svg/2560px-Lenovo_logo_2015.svg.png",
      },
      {
        merk: "Axioo MyBook Z10",
        serialNumber: "AXI-112233",
        color: "Silver",
        fundingSource: "Yayasan",
        status: "AVAILABLE",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Axioo_logo.svg/1024px-Axioo_logo.svg.png",
      },
      {
        merk: "Advan Soulmate G5",
        serialNumber: "ADV-445566",
        color: "Blue",
        fundingSource: "BOS 2024",
        status: "AVAILABLE",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Logo_Advan.png/1200px-Logo_Advan.png",
      },
      {
        merk: "Acer Aspire 5 Slim",
        serialNumber: "ACR-990011",
        color: "Steel Gray",
        fundingSource: "BOS 2024",
        status: "AVAILABLE",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Acer_2011.svg/2560px-Acer_2011.svg.png",
      },
    ],
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
