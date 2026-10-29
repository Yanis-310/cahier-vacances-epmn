import { PrismaClient } from "@prisma/client";

// Gives free access (paidAt) to USER accounts created before the paywall went live.
// Dry run by default; pass --apply to write.
//   npx tsx scripts/grant-access-existing-users.ts --avant=2026-11-05
//   npx tsx scripts/grant-access-existing-users.ts --avant=2026-11-05 --apply

const prisma = new PrismaClient();

function parseArgs() {
  const apply = process.argv.includes("--apply");
  const avantArg = process.argv.find((a) => a.startsWith("--avant="));
  if (!avantArg) {
    throw new Error(
      "Indiquez la date de mise en ligne du paiement : --avant=AAAA-MM-JJ (comptes créés avant cette date)."
    );
  }
  const avant = new Date(avantArg.slice("--avant=".length));
  if (Number.isNaN(avant.getTime())) {
    throw new Error(`Date invalide : ${avantArg}`);
  }
  return { apply, avant };
}

async function main() {
  const { apply, avant } = parseArgs();

  const where = { role: "USER" as const, paidAt: null, createdAt: { lt: avant } };
  const users = await prisma.user.findMany({
    where,
    select: { email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  for (const u of users) {
    console.log(`- ${u.email} (inscrit le ${u.createdAt.toISOString().slice(0, 10)})`);
  }
  console.log(`\n📊 ${users.length} compte(s) sans paiement créés avant le ${avant.toISOString().slice(0, 10)}`);

  if (!apply) {
    console.log("ℹ️  Simulation : rien n'a été modifié. Relancez avec --apply pour donner l'accès.");
    return;
  }

  // Same filter as the listing, so accounts created or paid in between are not touched.
  const result = await prisma.user.updateMany({ where, data: { paidAt: new Date() } });
  console.log(`✅ Accès offert à ${result.count} compte(s).`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
