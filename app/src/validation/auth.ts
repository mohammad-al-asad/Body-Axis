import { z } from 'zod';

export const genderSchema = z.enum(['male', 'female', 'other']);
export const otpPurposeSchema = z.enum(['email_verify', 'forgot_password']);

export function dateOfBirthToApiDate(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  if (date > new Date()) {
    return null;
  }

  const normalizedMonth = String(month).padStart(2, '0');
  const normalizedDay = String(day).padStart(2, '0');
  return `${year}-${normalizedMonth}-${normalizedDay}`;
}

export const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be 100 characters or less'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
    gender: genderSchema,
    dateOfBirth: z
      .string()
      .trim()
      .min(1, 'Date of birth is required')
      .refine((value) => dateOfBirthToApiDate(value) !== null, 'Use MM/DD/YYYY'),
    agree: z.boolean().refine((value) => value, 'You must agree to continue'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email'),
});

export const otpVerifySchema = z
  .object({
    email: z.email('Enter a valid email'),
    purpose: otpPurposeSchema,
    otpCode: z.string().regex(/^\d{4}$/, 'Enter the 4-digit code'),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.purpose !== 'forgot_password') {
      return;
    }

    if (!value.newPassword || value.newPassword.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password must be at least 8 characters',
        path: ['newPassword'],
      });
    }

    if (value.newPassword !== value.confirmNewPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmNewPassword'],
      });
    }
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type OtpVerifyFormValues = z.infer<typeof otpVerifySchema>;
