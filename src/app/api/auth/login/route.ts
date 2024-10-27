import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';
import { comparePassword, createJWT } from '@/utils/auth';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({
                status: 'error',
                errorCode: 'VALIDATION_ERROR',
                message: 'Email and password are required',
                errors: {
                    email: !email ? 'Email is required' : undefined,
                    password: !password ? 'Password is required' : undefined
                }
            }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await comparePassword(password, user.password))) {
            return NextResponse.json({
                status: 'error',
                errorCode: 'INVALID_CREDENTIALS',
                message: 'Invalid credentials. Please check your email and password.'
            }, { status: 401 });
        }

        const token = createJWT(user.id);
        return NextResponse.json({
            status: 'success',
            data: { token },
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Error during login:', error);

        return NextResponse.json({
            status: 'error',
            errorCode: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred. Please try again later.'
        }, { status: 500 });
    }
}
