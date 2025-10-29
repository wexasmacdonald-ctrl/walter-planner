export default function DeveloperPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-sky-900">Developer workspace</h1>
        <p className="text-base text-sky-700">
          This area is reserved for the in-house developer login that will be wired up later.
        </p>
      </header>

      <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-900">Coming soon</h2>
        <p className="mt-2 text-base text-sky-700">
          We&apos;ll plug in analytics, routing optimizations, and account controls here once the secure developer
          login is ready.
        </p>
        <p className="mt-4 text-sm text-sky-600">
          For now, focus on adding employees and assigning addresses from the Admin page.
        </p>
      </section>
    </div>
  );
}
