import { NextRequest, NextResponse } from 'next/server';

import { verifyJWT } from '@/utils/auth';

const allowedOrigins = [
  'https://mbramani.github.io',
  'https://moonshot-2024-10-12.vercel.app'
];

const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
};

export async function middleware(req: NextRequest) {
  try {
    const origin = req.headers.get('origin') ?? '';
    const isAllowedOrigin = allowedOrigins.includes(origin);

    // Handle preflighted requests
    if (req.method === 'OPTIONS') {
      const preflightHeaders = {
        ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
        ...corsOptions,
      };
      return NextResponse.json({}, { headers: preflightHeaders });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        {
          status: 'error',
          errorCode: 'AUTH_HEADER_MISSING',
          message: 'Authorization header is missing',
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        {
          status: 'error',
          errorCode: 'TOKEN_MISSING',
          message: 'Token is missing from authorization header',
        },
        { status: 401 }
      );
    }

    const decoded = await verifyJWT(token);
    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json(
        {
          status: 'error',
          errorCode: 'INVALID_TOKEN',
          message: 'Invalid token provided in authorization header',
        },
        { status: 401 }
      );
    }

    const response = NextResponse.next();
    response.headers.set('x-user-id', decoded.userId as string);

    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    Object.entries(corsOptions).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('Error during middleware:', error);
    return NextResponse.json(
      {
        status: 'error',
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: ['/api/auth/user', '/api/analytics'],
};