import { NextRequest, NextResponse } from 'next/server';

import { parseISODate } from '@/utils/parse-iso-date';
import prisma from '@/db/prisma';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) throw new Error('User ID not found in request headers');

        const { searchParams } = new URL(req.url);

        const dateFrom = searchParams.get('date_from');
        const dateTo = searchParams.get('date_to');
        const ageGroup = searchParams.get('age_group') as
            | 'AGE_15_25'
            | 'OVER_25'
            | null;
        const gender = searchParams.get('gender') as 'MALE' | 'FEMALE' | null;

        const startDate = dateFrom ? parseISODate(dateFrom) : null;
        const endDate = dateTo ? parseISODate(dateTo) : null;

        if (!dateFrom && !dateTo) {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'VALIDATION_ERROR',
                    message:
                        'Bad Request: start date and end date are required',
                    errors: {
                        date_from: 'Date from is required',
                        date_to: 'Date to is required',
                    },
                },
                { status: 400 }
            );
        }

        if ((dateFrom && !startDate) || (dateTo && !endDate)) {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'VALIDATION_ERROR',
                    message: 'Bad Request: Invalid date format',
                    errors: {
                        date_from:
                            dateFrom && !startDate
                                ? 'Invalid date format'
                                : undefined,
                        date_to:
                            dateTo && !endDate
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
