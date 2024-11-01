import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/db/prisma';

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get user information
 *     description: Retrieve the current user's information
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       '401':
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               authHeaderMissing:
 *                 summary: Authorization Header Missing
 *                 value:
 *                   status: error
 *                   errorCode: AUTH_HEADER_MISSING
 *                   message: 'Authorization header is missing'
 *               tokenMissing:
 *                 summary: Token Missing
 *                 value:
 *                   status: error
 *                   errorCode: TOKEN_MISSING
 *                   message: 'Token is missing from authorization header'
 *               invalidToken:
 *                 summary: Invalid Token
 *                 value:
 *                   status: error
 *                   errorCode: INVALID_TOKEN
 *                   message: 'Token is invalid or expired'
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               userNotFound:
 *                 summary: User Not Found
 *                 value:
 *                   status: error
 *                   errorCode: USER_NOT_FOUND
 *                   message: 'User not found'
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
export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) throw new Error('User ID not found in request headers');

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });
        if (!user) {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'USER_NOT_FOUND',
                    message: 'User not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    createdAt: user.createdAt,
                },
            },
            message: 'User data retrieved successfully',
        });
    } catch (error) {
        console.error('Error retrieving user data:', error);

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
