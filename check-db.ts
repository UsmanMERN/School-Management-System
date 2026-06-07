import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkUser() {
  const email = 'admin@edustream.com';
  const password = 'password123';
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.log('User not found in database:', email);
      return;
    }
    
    console.log('User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPasswordSet: user.password !== '',
    });
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid for "password123":', isPasswordValid);
    
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
