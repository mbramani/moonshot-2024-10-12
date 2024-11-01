# Moonshot 2024-10-12

This is the solution repository for Moonshot 2024-10-12 with solutions for Q1 and Q2.

## Tech Stack

- **Next.js**: React framework for server-side rendering and static site generation.
- **TypeScript**: Typed superset of JavaScript that compiles to plain JavaScript.
- **Prisma**: Next-generation ORM for Node.js and TypeScript.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **shadcn/ui**: Component library for building accessible and customizable UI components.
- **Recharts**: A composable charting library built on React components.
- **Swagger**: API documentation tool for designing and documenting RESTful APIs.
- **Vercel**: Deployment platform for modern web applications.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/mbramani/moonshot-2024-10-12.git
    cd moonshot-2024-10-12
    ```

2. Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

### Setting Up the Database

1. Create a `.env` file in the root directory and add your database connection string:

    ```env
    POSTGRES_PRISMA_URL=your_postgres_prisma_url
    POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
    JWT_SECRET=your_jwt_secret
    ```

    Replace `your_postgres_prisma_url`, `your_postgres_url_non_pooling`, and `your_jwt_secret` with your actual database connection string and JWT secret.

2. Generate the Prisma client:

    ```bash
    npx prisma generate
    ```

3. Run database migrations:

    ```bash
    npx prisma migrate dev --name init
    ```

4. Seed the database:

    ```bash
    npm run seed
    ```

### Running the Development Server

1. Start the development server:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Swagger Documentation

You can view the API documentation generated by Swagger at the following URL: [Swagger Documentation](https://moonshot-2024-10-12.vercel.app/api-docs)
