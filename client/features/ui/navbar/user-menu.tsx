"use client";
import { useLogout } from "@/features/auth/logout";
import { ProfileLevel, ProfileXPs, RankBadge } from "@/features/users/profile";
import {
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useCallback, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown";
import { useUserMenu } from "./use-user-menu";

interface UserMenuProps {
  username: string;
  catPoints: number;
  xpsGained: number;
  currentLevel: number;
  xpsRequired: number;
  rank: string;
}

export const UserMenu = (props: UserMenuProps) => {
  const { logout } = useLogout();
  const catPoints = useUserMenu.use.catPoints();
  const xpsGained = useUserMenu.use.xpsGained();
  const currentLevel = useUserMenu.use.currentLevel();
  const setCatPoints = useUserMenu.use.setCatPoints();
  const setXPs = useUserMenu.use.setXPs();
  const setLevel = useUserMenu.use.setLevel();
  const setXPsRequired = useUserMenu.use.setXPsRequired();
  const xpsRequired = useUserMenu.use.xpsRequired();
  const setRank = useUserMenu.use.setRank();
  const rank = useUserMenu.use.rank();
  const userMenuItems = useMemo(
    () => [
      {
        text: "Profile",
        href: `/player/${props.username}/profile`,
        icon: UserIcon,
      },
      { text: "Lobby", href: "/", icon: HomeIcon },
      { text: "Leaderboards", href: "/leaderboards", icon: ChartBarIcon },
      {
        text: "Friends",
        href: `player/${props.username}/friends`,
        icon: UserGroupIcon,
      },
      { text: "Settings", href: "/settings", icon: Cog6ToothIcon },
    ],
    [props.username],
  );

  useEffect(() => {
    setCatPoints(props.catPoints);
    setXPs(props.xpsGained);
    setLevel(props.currentLevel);
    setXPsRequired(props.xpsRequired);
    setRank(props.rank);
  }, [props]);

  const onLogout = useCallback(async () => {
    await logout();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger data-testid="user-menu-trigger">
        <Avatar>
          <AvatarImage src="/icons/beginner.jpg" alt="@shadcn" />
          <AvatarFallback>{props.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-x-4">
            {props.username}
            <ProfileLevel currentLevel={currentLevel} />
          </DropdownMenuLabel>

          <div className="px-2 py-1.5">
            <ProfileXPs xpsGained={xpsGained} xpsRequired={xpsRequired} />
          </div>
        </DropdownMenuGroup>
        <DropdownMenuGroup className="flex items-center px-2 py-1.5">
          <div>
            <RankBadge size="sm" rank={rank!} />
          </div>
          <DropdownMenuLabel className={rank !== "Unranked" ? "-ml-2" : "ml-1"}>
            <div className="text-base">{props.rank}</div>{" "}
            <div className="font-normal text-muted-foreground">
              {catPoints} CPs
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userMenuItems.map((item) => (
            <DropdownMenuItem asChild key={item.text}>
              <Link href={item.href}>
                <item.icon className="mr-2 h-5 w-5 text-muted-foreground" />
                <span>{item.text}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onLogout}>
            <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5 text-muted-foreground" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
