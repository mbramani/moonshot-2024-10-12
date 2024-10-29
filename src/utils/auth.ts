import 'server-only';

import { JWTPayload, SignJWT, jwtVerify } from 'jose';

import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'supersecretkey'
);

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePassword(
    plainText: string,
    hashed: string
): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
}

export async function createJWT(userId: number): Promise<string> {
    return new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1d')
        .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}
