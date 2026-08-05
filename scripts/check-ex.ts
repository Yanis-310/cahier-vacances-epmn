import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const exs = await p.exercise.findMany({
    where: { number: { in: [29, 30] } },
    select: { number: true, title: true, type: true },
  });
  console.log(JSON.stringify(exs, null, 2));
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
