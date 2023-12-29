import { Badge as BadgeIcon } from "lucide-react";

interface ProfileLevelProps {
  currentLevel: number;
}

export const ProfileLevel = ({ currentLevel }: ProfileLevelProps) => {
  return (
    <div
      data-testid="profile-level"
      className="flex items-center gap-x-1 font-medium text-blue-600 dark:text-blue-300"
    >
      <BadgeIcon className="h-5 w-5" />
      {currentLevel}
    </div>
  );
};
