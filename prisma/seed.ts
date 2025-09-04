import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('SuperSecure2024!CleanFoss', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'CleanFoss Super Administrator',
      email: 'admin@cleanfoss.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Super admin created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });