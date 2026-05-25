import { Prisma, PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const prisma = new PrismaClient();
const rootDir = join(__dirname, '..');

type MongoId = { _id: { $oid: string } };

type BabyStateSeed = MongoId & {
  analogy: string | null;
  weekNumber: number;
  babySize: number;
  babyWeight: number;
  image: string;
  babyActivity: string;
  babyDevelopment: string;
  interestingFact: string;
  momDailyTips: string[];
};

type MomStateSeed = MongoId & {
  weekNumber: number;
  feelings: Prisma.InputJsonValue;
  comfortTips: Prisma.InputJsonValue;
};

type EmotionSeed = MongoId & {
  title: string;
};

function readSeedFile<T>(filename: string): T[] {
  const content = readFileSync(join(rootDir, filename), 'utf8');
  return JSON.parse(content) as T[];
}

async function seedBabyStates() {
  const babyStates = readSeedFile<BabyStateSeed>('lehlehka.baby_states.json');

  for (const state of babyStates) {
    await prisma.babyState.upsert({
      where: { sourceId: state._id.$oid },
      create: {
        sourceId: state._id.$oid,
        weekNumber: state.weekNumber,
        analogy: state.analogy,
        babySize: state.babySize,
        babyWeight: state.babyWeight,
        image: state.image,
        babyActivity: state.babyActivity,
        babyDevelopment: state.babyDevelopment,
        interestingFact: state.interestingFact,
        momDailyTips: state.momDailyTips,
      },
      update: {
        weekNumber: state.weekNumber,
        analogy: state.analogy,
        babySize: state.babySize,
        babyWeight: state.babyWeight,
        image: state.image,
        babyActivity: state.babyActivity,
        babyDevelopment: state.babyDevelopment,
        interestingFact: state.interestingFact,
        momDailyTips: state.momDailyTips,
      },
    });
  }
}

async function seedMomStates() {
  const momStates = readSeedFile<MomStateSeed>('lehlehka.mom_states.json');

  for (const state of momStates) {
    await prisma.momState.upsert({
      where: { sourceId: state._id.$oid },
      create: {
        sourceId: state._id.$oid,
        weekNumber: state.weekNumber,
        feelings: state.feelings,
        comfortTips: state.comfortTips,
      },
      update: {
        weekNumber: state.weekNumber,
        feelings: state.feelings,
        comfortTips: state.comfortTips,
      },
    });
  }
}

async function seedEmotions() {
  const emotions = readSeedFile<EmotionSeed>('lehlehka.emotions.json');

  for (const emotion of emotions) {
    await prisma.emotion.upsert({
      where: { sourceId: emotion._id.$oid },
      create: {
        sourceId: emotion._id.$oid,
        title: emotion.title,
      },
      update: {
        title: emotion.title,
      },
    });
  }
}

async function main() {
  await seedBabyStates();
  await seedMomStates();
  await seedEmotions();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
