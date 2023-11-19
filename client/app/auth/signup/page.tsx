import { AuthWrapper } from "@/features/auth/shared";
import { SignupForm } from "@/features/auth/signup";
import { getCurrentUser } from "@/features/users/me";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Get started",
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="container">
      <AuthWrapper
        title="Create an account"
        subtitle="Let's get started with our league journey 🏆"
      >
        <SignupForm />
        <div className="mt-3 text-center text-sm text-secondary-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </div>
      </AuthWrapper>
    </div>
  );
}
