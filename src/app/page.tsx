import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-50">
            <section className="text-center space-y-6">
                <header>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Welcome to Moonshot test solution
                    </h1>
                    <p className="text-lg text-gray-600 font-medium">
                        Below is the link to the two solutions
                    </p>
                </header>

                <nav>
                    <ul className="md:flex justify-center space-x-2 sm:space-y-2 md:space-y-0 text-gray-500 text-sm font-medium">
                        <li>
                            <Link
                                href="/email-client"
                                title="Email Client Solution"
                                className="inline-block px-4 py-2 bg-red-200 hover:bg-red-100 rounded-md"
                            >
                                Email Client Solution
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/dashboard"
                                title="Data Visualization Dashboard Solution"
                                className="inline-block px-4 py-2 bg-blue-200 hover:bg-blue-100 rounded-md"
                            >
                                Data Visualization Dashboard Solution
                            </Link>
                        </li>
                    </ul>
                </nav>
            </section>
        </main>
    );
}
