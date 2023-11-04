const calculateNumberOfWordsTyped = (charsTyped: number) => {
  return charsTyped / 5;
};

const convertToMinutes = (ms: number) => {
  return ms / 1000 / 60;
};

export const calculateWpm = (charsTyped: number, timeTaken: number) => {
  return Math.trunc(
    calculateNumberOfWordsTyped(charsTyped) / convertToMinutes(timeTaken),
  );
};

export const calculateAccuracy = (typos: number, charsTyped: number) => {
  const acc = 100 - +((typos / charsTyped) * 100).toFixed(1);
  return isNaN(acc) ? 0 : acc;
};

export const calculateProgress = (charsTyped: number, paragraph: string) =>
  Math.trunc((charsTyped / paragraph.length) * 100);
