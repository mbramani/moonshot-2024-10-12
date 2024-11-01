import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, createJWT } from '@/utils/auth';

import prisma from '@/db/prisma';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user and receive a JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validationError:
 *                 summary: Validation Error
 *                 value:
 *                   status: error
 *                   errorCode: VALIDATION_ERROR
 *                   message: 'Email and password are required'
 *                   errors:
 *                     email: 'Email is required'
 *                     password: 'Password is required'
 *       '401':
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidCredentials:
 *                 summary: Invalid Credentials
 *                 value:
 *                   status: error
 *                   errorCode: INVALID_CREDENTIALS
 *                   message: 'Invalid credentials. Please check your email and password.'
 *                   errors:
 *                     email: 'No account found with this email address'
 *                     password: 'The password you entered is incorrect'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               internalServerError:
 *                 summary: Internal Server Error
 *                 value:
 *                   status: error
 *                   errorCode: INTERNAL_SERVER_ERROR
 *                   message: 'An unexpected error occurred. Please try again later.'
 */

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'VALIDATION_ERROR',
                    message: 'Email and password are required',
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

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await comparePassword(password, user.password))) {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'INVALID_CREDENTIALS',
                    message:
                        'Invalid credentials. Please check your email and password.',
                    errors: {
                        email: !user
                            ? 'No account found with this email address'
                            : undefined,
                        password: user
                            ? 'The password you entered is incorrect'
                            : undefined,
                    },
                },
                { status: 401 }
            );
        }

        const token = await createJWT(user.id);
        return NextResponse.json({
            status: 'success',
            data: { token },
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Error during login:', error);

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
