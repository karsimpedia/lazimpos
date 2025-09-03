import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const cat = await prisma.productCategory.upsert({
    where: { code: "FISIK" },
    update: {},
    create: { code: "FISIK", name: "Produk Fisik" }
  });
  const tax = await prisma.taxRate.upsert({
    where: { id: "ppn-11" },
    update: {},
    create: { id: "ppn-11", name: "PPN 11%", percent: 11, isActive: true }
  });
  await prisma.product.createMany({
    data: [
      { categoryId: cat.id, code: "SKU-ROKOK-A", name: "Rokok A", type: "FISIK", unit: "PCS", trackStock: true, costPrice: 25000, sellPrice: 30000, margin: 5000, taxRateId: tax.id },
      { categoryId: cat.id, code: "SKU-AIRTNG", name: "Air Mineral 600ml", type: "FISIK", unit: "PCS", trackStock: true, costPrice: 3000, sellPrice: 5000, margin: 2000 },
      { categoryId: cat.id, code: "SKU-SNACK1", name: "Snack 1", type: "FISIK", unit: "PCS", trackStock: true, costPrice: 4000, sellPrice: 7000, margin: 3000 }
    ]
  });
  console.log("Seed OK");
}

main().finally(() => prisma.$disconnect());
