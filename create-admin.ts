import { PrismaClient, Role, SchoolType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    let school = await prisma.school.findFirst();

    if (!school) {
      console.log('No school found, creating one...');
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
    }

    const email = 'admin@edustream.com';
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword, role: Role.ADMIN, schoolId: school.id }
        });
        console.log('Admin user updated successfully.');
    } else {
        await prisma.user.create({
          data: {
            id: uuidv4(),
            email: email,
            name: 'Test Admin',
            role: Role.ADMIN,
            password: hashedPassword,
            schoolId: school.id
          }
        });
        console.log('Admin user created successfully.');
    }
  } catch (err) {
    console.error('Error creating admin user:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
