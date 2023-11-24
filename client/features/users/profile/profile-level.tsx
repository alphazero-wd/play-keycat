import { AcademicCapIcon } from "@heroicons/react/20/solid";

interface ProfileLevelProps {
  currentLevel: number;
}

export const ProfileLevel = ({ currentLevel }: ProfileLevelProps) => {
  return (
    <div className="flex items-center gap-x-1 font-medium text-blue-600 dark:text-blue-300">
      <AcademicCapIcon className="h-5 w-5" />
      {currentLevel}
    </div>
  );
};
