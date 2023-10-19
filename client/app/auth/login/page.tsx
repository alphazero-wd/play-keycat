import { AuthWrapper } from "@/features/auth/shared";
import Link from "next/link";
import { LoginForm } from "@/features/auth/login";
import { getCurrentUser } from "@/features/users/actions";
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
        <div className="text-sm text-secondary-foreground mt-3 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-primary">
            Sign up
          </Link>
        </div>
      </AuthWrapper>
    </div>
  );
}
