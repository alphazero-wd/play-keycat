import Link from "next/link";
import { Button, Logo } from "@/features/ui";
import { getCurrentUser } from "@/features/users/actions";
import { UserMenu } from "./user-menu";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header>
      <nav className="bg-white shadow-md border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
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
