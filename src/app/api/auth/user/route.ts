import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';
import { verifyJWT } from '@/utils/auth';

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({
                status: 'error',
                errorCode: 'AUTH_HEADER_MISSING',
                message: 'Authorization header is missing'
            }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return NextResponse.json({
                status: 'error',
                errorCode: 'TOKEN_MISSING',
                message: 'Token is missing from authorization header'
            }, { status: 401 });
        }

        const decoded = verifyJWT(token);
        if (!decoded || typeof decoded === 'string') {
            return NextResponse.json({
                status: 'error',
                errorCode: 'INVALID_TOKEN',
                message: 'Invalid token provided in authorization header'
            }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return NextResponse.json({
                status: 'error',
                errorCode: 'USER_NOT_FOUND',
                message: 'User not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    createdAt: user.createdAt,
            } },
            message: 'User data retrieved successfully'
        });

    } catch (error) {
        console.error('Error retrieving user data:', error);

        return NextResponse.json({
            status: 'error',
            errorCode: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred. Please try again later.'
        }, { status: 500 });
    }
}