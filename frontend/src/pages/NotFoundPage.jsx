import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-white">
      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-accent-300">404</p>
        <h1 className="text-3xl font-semibold">This route does not exist.</h1>
        <Link
          to="/dashboard"
          className="inline-flex rounded-2xl bg-accent-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-accent-400"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
