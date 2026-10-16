const PagePlaceholder = ({ title }: { title: string }) => (
  <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
    <h1 className="text-5xl font-bold text-primary">{title}</h1>
    <p className="mt-3 text-lg text-muted">This page is coming soon.</p>
  </section>
);

export default PagePlaceholder;
