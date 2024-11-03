import { AgeGroup, Gender } from '@prisma/client';

export function sanitizeEnum<T extends object>(
    value: string,
    enumType: T
): T[keyof T] | null {
    return value in enumType ? (value as T[keyof T]) : null;
}

export function sanitizeAgeGroupEnum(
    value: AgeGroup | string | null | undefined
): AgeGroup | null {
    if (!value) return null;
    return sanitizeEnum(value, AgeGroup);
}

export function sanitizeGenderEnum(
    value: Gender | string | null | undefined
): Gender | null {
    if (!value) return null;
    return sanitizeEnum(value, Gender);
}
