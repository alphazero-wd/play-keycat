export const addSeconds = (seconds: number) => {
  return new Date(new Date().getTime() + seconds * 1000);
};
