import { NextRequest, NextResponse } from 'next/server';
import { validateEmail, validatePassword } from '@/utils/validation';

import { hashPassword } from '@/utils/auth';
import prisma from '@/db/prisma';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'VALIDATION_ERROR',
                    message: 'Email and password required',
                    errors: {
                        email: !email ? 'Email is required' : undefined,
                        password: !password
                            ? 'Password is required'
                            : undefined,
                    },
                },
                { status: 400 }
            );
        }

        if (!validateEmail(email)) {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'INVALID_EMAIL_FORMAT',
                    message: 'The provided email format is incorrect',
                    errors: { email: 'Please provide a valid email address' },
                },
                { status: 400 }
            );
        }

        if (!validatePassword(password)) {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'WEAK_PASSWORD',
                    message: 'Password does not meet security criteria',
                    errors: {
                        password:
                            'Password should be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character',
                    },
                },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'USER_ALREADY_EXISTS',
                    message: 'A user with this email already exists',
                    errors: { email: 'Email is already in use' },
                },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });

        return NextResponse.json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    createdAt: user.createdAt,
                },
            },
        });
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json(
            {
                status: 'error',
                errorCode: 'INTERNAL_SERVER_ERROR',
                message:
                    'An unexpected error occurred. Please try again later.',
            },
            { status: 500 }
        );
    }
}
