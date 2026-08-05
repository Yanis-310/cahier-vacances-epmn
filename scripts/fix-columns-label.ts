import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find all free_text exercises that have columns.right = "Reformulation"
  const exercises = await prisma.exercise.findMany({
    where: { type: "free_text" },
  });

  let updated = 0;
  for (const ex of exercises) {
    const content = ex.content as Record<string, unknown>;
    const columns = content?.columns as { left: string; right: string } | undefined;
    
    if (columns && columns.right === "Reformulation") {
      const newContent = {
        ...content,
        columns: { ...columns, right: "Proposition" },
      };
      
      await prisma.exercise.update({
        where: { id: ex.id },
        data: { content: newContent },
      });
      
      console.log(`✅ Exercice ${ex.number} ("${ex.title}") : "Reformulation" → "Proposition"`);
      updated++;
    } else {
      console.log(`⏭️  Exercice ${ex.number} ("${ex.title}") : déjà correct ou pas de columns`);
    }
  }
  
  console.log(`\n📊 Total mis à jour : ${updated}/${exercises.length} exercices free_text`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
