export const sleep = async (timeMS: number) => {
  if (timeMS === 0) return;

  return new Promise<void>((res) => setTimeout(() => res(), timeMS));
};
