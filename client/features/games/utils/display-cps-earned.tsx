import {
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";

export const displayCPsEarned = (catPoints: number) => {
  if (catPoints > 0) {
    return (
      <span className="bg-green-100 text-green-800 text-xs font-medium inline-flex items-center px-4 py-1 rounded-md dark:bg-green-900 dark:text-green-300">
        <ArrowUpIcon className="w-4 h-4 mr-1.5" />
        {catPoints}
      </span>
    );
  } else if (catPoints < 0) {
    return (
      <span className="bg-red-100 text-red-800 text-xs font-medium inline-flex items-center px-4 py-1 rounded-md dark:bg-red-900 dark:text-red-300">
        <ArrowDownIcon className="w-4 h-4 mr-1.5" />
        {Math.abs(catPoints)}
      </span>
    );
  } else {
    return (
      <span className="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-4 py-1 rounded-md dark:bg-gray-900 dark:text-gray-300">
        <MinusIcon className="w-4 h-4 mr-1.5" />
        {catPoints}
      </span>
    );
  }
};
