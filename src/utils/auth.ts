import "server-only";
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePassword(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
}

export function createJWT(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyJWT(token: string): JwtPayload | string | null {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}
