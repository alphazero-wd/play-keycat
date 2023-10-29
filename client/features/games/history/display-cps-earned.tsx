import {
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";

export const displayCPsEarned = (catPoints: number) => {
  if (catPoints > 0) {
    return (
      <span className="inline-flex items-center rounded-md bg-green-100 px-4 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
        <ArrowUpIcon className="mr-1.5 h-4 w-4" />
        {catPoints}
      </span>
    );
  } else if (catPoints < 0) {
    return (
      <span className="inline-flex items-center rounded-md bg-red-100 px-4 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
        <ArrowDownIcon className="mr-1.5 h-4 w-4" />
        {Math.abs(catPoints)}
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center rounded-md bg-gray-100 px-4 py-1 text-xs font-medium text-gray-800 dark:bg-gray-900 dark:text-gray-300">
        <MinusIcon className="mr-1.5 h-4 w-4" />
        {catPoints}
      </span>
    );
  }
};
