import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import prisma from '@/db/prisma';
import { AgeGroup, Gender } from '@prisma/client';

interface CsvData {
    day: string;
    ageGroup: '15-25' | '>25';
    gender: 'Male' | 'Female';
    featureA: number;
    featureB: number;
    featureC: number;
    featureD: number;
    featureE: number;
    featureF: number;
}

// Read and parse CSV data
async function readCsv(filePath: string): Promise<CsvData[]> {
    const results: CsvData[] = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                try {
                    results.push({
                        day: data.Day,
                        ageGroup: data.Age as '15-25' | '>25',
                        gender: data.Gender as 'Male' | 'Female',
                        featureA: parseInt(data.A, 10) || 0,
                        featureB: parseInt(data.B, 10) || 0,
                        featureC: parseInt(data.C, 10) || 0,
                        featureD: parseInt(data.D, 10) || 0,
                        featureE: parseInt(data.E, 10) || 0,
                        featureF: parseInt(data.F, 10) || 0,
                    });
                } catch (error) {
                    console.error('Error parsing data:', error);
                }
            })
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

function parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map((part) => parseInt(part, 10));
    return new Date(year, month - 1, day);
}

// Seed the data into the database
async function seedData() {
    const filePath = path.join(process.cwd(), 'prisma/data.csv');
    try {
        const csvData = await readCsv(filePath);

        // Prepare and insert data
        const dataToInsert = csvData.map((entry) => ({
            day: parseDate(entry.day),
            ageGroup: entry.ageGroup === '15-25' ? AgeGroup.AGE_15_25 : AgeGroup.OVER_25,
            gender: entry.gender === 'Male' ? Gender.MALE : Gender.FEMALE,
            featureA: entry.featureA,
            featureB: entry.featureB,
            featureC: entry.featureC,
            featureD: entry.featureD,
            featureE: entry.featureE,
            featureF: entry.featureF,
        }));

        await prisma.featureUsage.createMany({ data: dataToInsert });

        console.log('Data seeded successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedData()
    .catch((error) => console.error('Seeding failed:', error));
