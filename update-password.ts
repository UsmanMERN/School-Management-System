import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updatePassword() {
  const email = 'admin@edustream.com';
  const newPassword = 'password123';
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    console.log('Password updated successfully to "password123"!');
  } catch (err) {
    console.error('Error updating password:', err);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
