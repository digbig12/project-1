'use server';

import { signIn } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { generateTwoFactorToken } from '@/lib/actions';

export async function authenticate(
  prevState: any,
  formData: FormData,
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const captcha = formData.get('captcha') as string;
  const captchaExpected = formData.get('captchaExpected') as string;
  const code = formData.get('code') as string; // Optional 2FA code

  // 1. CAPTCHA Validation
  if (captcha !== captchaExpected) {
    return { error: 'Invalid CAPTCHA code. Please try again.' };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return { error: 'Invalid credentials.' };

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) return { error: 'Invalid credentials.' };

    // 2. 2FA Check
    if (user.isTwoFactorEnabled) {
      if (code) {
        // Verify code
        const storedToken = await prisma.twoFactorToken.findFirst({
          where: { userId: user.id },
          orderBy: { expires: 'desc' }
        });

        if (!storedToken || storedToken.token !== code) {
          return { error: 'Invalid verification code.', twoFactor: true };
        }

        if (new Date() > storedToken.expires) {
          return { error: 'Verification code expired.', twoFactor: true };
        }

        // Cleanup and proceed
        await prisma.twoFactorToken.delete({ where: { id: storedToken.id } });
      } else {
        // Trigger 2FA
        const token = await generateTwoFactorToken(email);
        return { 
          success: true, 
          twoFactor: true, 
          email, // Persist for 2FA submission
          password, // Persist for 2FA submission
          message: `Your verification code is: ${token?.token} (Simulated Email)` 
        };
      }
    }

    // 3. Final Sign In
    await signIn('credentials', { email, password, redirectTo: '/' });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials.' };
        default:
          return { error: 'Something went wrong.' };
      }
    }
    // Next.js redirect creates an error that we shouldn't catch
    throw error;
  }
}

export async function register(
  prevState: any,
  formData: FormData,
) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const companyName = formData.get('companyName') as string;
  const isTwoFactorEnabled = formData.get('isTwoFactorEnabled') === 'on';

  if (!email || !password || !name) {
    return { error: 'Please fill in all fields.' };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyName: companyName || null,
        isTwoFactorEnabled
      },
    });

    if (user) {
      await signIn('credentials', { email, password, redirectTo: '/' });
    }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'User already exists with this email.' };
    }
    // Re-throw to allow Next.js redirects to work
    throw error;
  }
}
