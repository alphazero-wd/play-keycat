import { getCurrentUser } from "@/features/users/me";
import Link from "next/link";
import { Button } from "../button";
import { Logo } from "../logo";
import { UserMenu } from "./user-menu";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header>
      <nav className="border-gray-200 bg-white px-4 py-2.5 shadow-md dark:bg-gray-800 lg:px-6">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex items-center gap-x-3">
              <Button asChild variant="outline">
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
