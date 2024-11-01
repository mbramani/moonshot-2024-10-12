import "server-only"

import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
    const spec = createSwaggerSpec({
        apiFolder: 'src/app/api',
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Moonshot 2024-10-12 Q2 API Documentation',
                description:
                    'API documentation for authentication and analytics endpoints',
                version: '1.0.0',
            },
            servers: [
                {
                    url: 'https://moonshot-2024-10-12.vercel.app',
                    description: 'Api base URL',
                },
            ],
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },

                schemas: {
                    Error: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'string',
                                enum: ['error'],
                            },
                            errorCode: {
                                type: 'string',
                            },
                            message: {
                                type: 'string',
                            },
                            errors: {
                                type: 'object',
                                additionalProperties: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                    LoginRequest: {
                        type: 'object',
                        required: ['email', 'password'],
                        properties: {
                            email: {
                                type: 'string',
                                format: 'email',
                            },
                            password: {
                                type: 'string',
                            },
                        },
                    },
                    LoginResponse: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'string',
                                enum: ['success'],
                            },
                            data: {
                                type: 'object',
                                properties: {
                                    token: {
                                        type: 'string',
                                    },
                                },
                            },
                            message: {
                                type: 'string',
                            },
                        },
                    },
                    RegisterRequest: {
                        type: 'object',
                        required: ['email', 'password'],
                        properties: {
                            email: {
                                type: 'string',
                                format: 'email',
                            },
                            password: {
                                type: 'string',
                                description:
                                    'Must be at least 8 characters with one uppercase, lowercase, number, and special character',
                            },
                        },
                    },
                    RegisterResponse: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'string',
                                enum: ['success'],
                            },
                            message: {
                                type: 'string',
                            },
                            data: {
                                type: 'object',
                                properties: {
                                    user: {
                                        type: 'object',
                                        properties: {
                                            id: {
                                                type: 'string',
                                            },
                                            email: {
                                                type: 'string',
                                            },
                                            createdAt: {
                                                type: 'string',
                                                format: 'date-time',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    UserResponse: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'string',
                                enum: ['success'],
                            },
                            data: {
                                type: 'object',
                                properties: {
                                    user: {
                                        type: 'object',
                                        properties: {
                                            id: {
                                                type: 'string',
                                            },
                                            email: {
                                                type: 'string',
                                            },
                                            createdAt: {
                                                type: 'string',
                                                format: 'date-time',
                                            },
                                        },
                                    },
                                },
                            },
                            message: {
                                type: 'string',
                            },
                        },
                    },
                    AnalyticsResponse: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'string',
                                enum: ['success'],
                            },
                            data: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        day: {
                                            type: 'string',
                                            format: 'date',
                                        },
                                        ageGroup: {
                                            type: 'string',
                                            enum: ['AGE_15_25', 'OVER_25'],
                                        },
                                        gender: {
                                            type: 'string',
                                            enum: ['MALE', 'FEMALE'],
                                        },
                                        featureA: {
                                            type: 'integer',
                                        },
                                        featureB: {
                                            type: 'integer',
                                        },
                                        featureC: {
                                            type: 'integer',
                                        },
                                        featureD: {
                                            type: 'integer',
                                        },
                                        featureE: {
                                            type: 'integer',
                                        },
                                        featureF: {
                                            type: 'integer',
                                        },
                                    },
                                },
                            },
                            message: {
                                type: 'string',
                            },
                            meta: {
                                type: 'object',
                                properties: {
                                    totalItems: {
                                        type: 'integer',
                                    },
                                    itemsPerPage: {
                                        type: 'integer',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            security: [],
            tags: [
                { name: 'Authentication' },
                {
                    name: 'Analytics',
                },
            ],
        },
    });
    return spec;
};
