import { LoginForm } from "@/features/auth/login";
import { AuthWrapper } from "@/features/auth/shared";
import { getCurrentUser } from "@/features/users/me";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Log in",
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="container">
      <AuthWrapper
        title="Log in to your account"
        subtitle="Continue your league journey"
      >
        <LoginForm />
        <div className="mt-3 text-center text-sm text-secondary-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-primary">
            Sign up
          </Link>
        </div>
      </AuthWrapper>
    </div>
  );
}
