import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/db/prisma';

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
