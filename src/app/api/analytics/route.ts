import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/db/prisma';

function parseDate(dateString: string): Date | null {
    const [day, month, year] = dateString.split('/').map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(Date.UTC(year, month - 1, day));
}

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) throw new Error('User ID not found in request headers');

        const { searchParams } = new URL(req.url);

        const startDay = searchParams.get('start_day');
        const endDay = searchParams.get('end_day');
        const ageGroup = searchParams.get('age_group') as
            | 'AGE_15_25'
            | 'OVER_25'
            | null;
        const gender = searchParams.get('gender') as 'MALE' | 'FEMALE' | null;

        const startDate = startDay ? parseDate(startDay) : null;
        const endDate = endDay ? parseDate(endDay) : null;

        if ((startDay && !startDate) || (endDay && !endDate)) {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'VALIDATION_ERROR',
                    message: 'Bad Request: Invalid date format',
                    errors: {
                        start_day:
                            startDay && !startDate
                                ? 'Invalid date format'
                                : undefined,
                        end_day:
                            endDay && !endDate
                                ? 'Invalid date format'
                                : undefined,
                    },
                },
                { status: 400 }
            );
        }

        const validAgeGroups = ['AGE_15_25', 'OVER_25'];
        const validGenders = ['MALE', 'FEMALE'];

        if (ageGroup && !validAgeGroups.includes(ageGroup)) {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'VALIDATION_ERROR',
                    message: 'Bad Request: Invalid age group',
                    errors: {
                        age_group:
                            'Invalid age group provided,must be one of AGE_15_25 or OVER_25',
                    },
                },
                { status: 400 }
            );
        }

        if (gender && !validGenders.includes(gender)) {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'VALIDATION_ERROR',
                    message: 'Bad Request: Invalid gender',
                    errors: {
                        gender: 'Invalid gender provided, must be one of MALE or FEMALE',
                    },
                },
                { status: 400 }
            );
        }

        const where: Record<string, unknown> = {
            ...(startDate &&
                endDate && { day: { gte: startDate, lte: endDate } }),
            ...(ageGroup && { ageGroup }),
            ...(gender && { gender }),
        };

        const data = await prisma.featureUsage.findMany({
            where,
            take: 1000,
        });

        return NextResponse.json({
            status: 'success',
            data,
            message: 'Analytics data retrieved successfully',
            meta: {
                totalItems: data.length,
                itemsPerPage: 1000,
            },
        });
    } catch (error) {
        console.error('Error fetching analytics data:', error);
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
