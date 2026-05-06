'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export async function requestPasswordReset(
  prevState: any,
  formData: FormData,
) {
  const email = formData.get('email') as string;
  const captcha = formData.get('captcha') as string;
  const captchaExpected = formData.get('captchaExpected') as string;

  if (!email) {
    return { error: 'Please provide an email address.' };
  }

  if (captcha !== captchaExpected) {
    return { error: 'Invalid security code. Please try again.' };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // For security reasons, we do not want to confirm whether a user exists.
    // However, since we are returning the mock token to the UI for testing, we will just error out early if no user exists.
    if (!user) {
         return { error: 'If an account exists, a reset link has been sent. (Mock: No user found)' };
    }

    // Generate token
    const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code for simplicity
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

    // Delete existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    await prisma.passwordResetToken.create({
      data: {
        token,
        expires,
        userId: user.id
      }
    });

    return { 
      success: true, 
      message: `Your password reset token is: ${token} (Simulated Email)`,
      token: token // Passed back for UI display in this mocked flow
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { error: 'Something went wrong processing your request.' };
  }
}

export async function resetPassword(
  prevState: any,
  formData: FormData,
) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;

  if (!token || !password) {
    return { error: 'Please provide both a token and a new password.' };
  }
  
  if (password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
  }

  try {
    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!existingToken) {
      return { error: 'Invalid or expired token.' };
    }

    if (new Date() > existingToken.expires) {
      return { error: 'Token has expired. Please request a new one.' };
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.update({
      where: { id: existingToken.userId },
      data: { password: hashedPassword }
    });

    // Clean up
    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id }
    });

    return { success: true, message: 'Password has been successfully reset. Redirecting to login...' };
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: 'Something went wrong updating your password.' };
  }
}
