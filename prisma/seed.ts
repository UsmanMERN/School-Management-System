import { PrismaClient, Role, SchoolType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // 1. Create or ensure a default school exists
  let school = await prisma.school.findFirst();

  if (!school) {
    console.log('No school found, creating default EduStream High School...');
    school = await prisma.school.create({
      data: {
        id: uuidv4(),
        name: 'EduStream High School',
        address: '123 Main St',
        logo: '/logo.png',
        principal: 'Mr. Principal',
        vicePrincipal: 'Mrs. Vice Principal',
        slogan: 'Learning for life',
        type: SchoolType.SENIOR,
        startHour: '08:00',
        closeHour: '15:00',
        timetableHtml: '<div></div>',
        admins: ['admin@edustream.com']
      }
    });
  } else {
    console.log(`School already exists: ${school.name}`);
  }

  // 2. Create the default admin user
  const email = 'admin@edustream.com';
  const password = 'password123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const existingAdmin = await prisma.user.findUnique({ where: { email } });

  if (!existingAdmin) {
    console.log(`Creating default admin user (${email})...`);
    await prisma.user.create({
      data: {
        id: uuidv4(),
        email: email,
        name: 'Super Admin',
        role: Role.ADMIN,
        password: hashedPassword,
        schoolId: school.id
      }
    });
  } else {
    console.log(`Admin user (${email}) already exists. Updating password...`);
    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword, 
        role: Role.ADMIN, 
        schoolId: school.id 
      }
    });
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
