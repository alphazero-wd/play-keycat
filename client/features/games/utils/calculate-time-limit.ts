export const calculateTimeLimit = (wpm: number, paragraph: string) => {
  return Math.trunc((paragraph.length / 5 / wpm) * 60);
};
