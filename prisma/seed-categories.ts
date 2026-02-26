import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  { name: "Writing", slug: "writing", color: "purple", sortOrder: 1 },
  { name: "Code", slug: "code", color: "blue", sortOrder: 2 },
  { name: "Marketing", slug: "marketing", color: "green", sortOrder: 3 },
  { name: "Design", slug: "design", color: "pink", sortOrder: 4 },
  { name: "Business", slug: "business", color: "orange", sortOrder: 5 },
  { name: "Education", slug: "education", color: "yellow", sortOrder: 6 },
  { name: "Creative", slug: "creative", color: "red", sortOrder: 7 },
  { name: "Productivity", slug: "productivity", color: "cyan", sortOrder: 8 },
  { name: "Research", slug: "research", color: "indigo", sortOrder: 9 },
  { name: "Other", slug: "other", color: "gray", sortOrder: 10 },
];

async function main() {
  console.log("Seeding default categories...");

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        ...category,
        isSystem: true,
      },
    });
  }

  console.log("Default categories seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding categories:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
