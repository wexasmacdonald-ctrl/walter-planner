import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const addresses = [
  '120 Queen St, Ottawa, ON, Canada',
  '710 9 Ave SW, Calgary, AB, Canada',
  '777 Dunsmuir St, Vancouver, BC, Canada',
];

async function main() {
  await prisma.client.deleteMany();
  await prisma.client.createMany({
    data: addresses.map((addressLine) => ({ addressLine })),
  });
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
