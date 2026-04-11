import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-xl text-center">
        <div className="inline-flex items-center gap-2 mb-6 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium">
          <span className="text-lg">$</span> Spendwise
        </div>
        <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-4">
          Take control of your spending
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          Create budgets, track expenses, and visualise where your money goes —
          all in one place.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/sign-up"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/sign-in"
            className="border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
