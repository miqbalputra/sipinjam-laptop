const { PrismaClient } = require("@prisma/client");

async function test() {
  console.log("Starting test...");
  try {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: "file:./dev.db"
            }
        }
    });
    console.log("Client created");
    const adminCount = await prisma.admin.count();
    console.log("Admin count:", adminCount);
    await prisma.$disconnect();
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
