"use client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/ui";
import { User } from "@/features/users/types";
import {
  UserIcon,
  HomeIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo } from "react";
import { useLogout } from "@/features/auth/logout";

interface UserMenuProps {
  user: User;
}

export const UserMenu = ({ user }: UserMenuProps) => {
  const { logout } = useLogout();
  const userMenuItems = useMemo(
    () => [
      {
        text: "Profile",
        href: `/player/${user.username}/profile`,
        icon: UserIcon,
      },
      { text: "Lobby", href: "/", icon: HomeIcon },
      { text: "Leaderboards", href: "/leaderboards", icon: ChartBarIcon },
      {
        text: "Friends",
        href: `player/${user.username}/friends`,
        icon: UserGroupIcon,
      },
      { text: "Settings", href: "/settings", icon: Cog6ToothIcon },
    ],
    [user.username]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src="/icons/sprout.jpg" alt="@shadcn" />
          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
          <DropdownMenuLabel className="font-normal">
            {user.catPoints} CPs
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userMenuItems.map((item) => (
            <DropdownMenuItem asChild key={item.text}>
              <Link href={item.href}>
                <item.icon className="mr-2 w-4 h-4" />
                <span>{item.text}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={logout}>
            <ArrowRightOnRectangleIcon className="mr-2 w-4 h-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
