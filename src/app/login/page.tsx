import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  // Read the flag on the server and pass it down, rather than reaching for
  // useSearchParams() in the client — that would need a Suspense boundary.
  const { expired } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <LoginForm expired={Boolean(expired)} />
    </div>
  );
}
