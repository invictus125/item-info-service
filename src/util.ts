export async function waitMs(ms: number): Promise<any> {
  return new Promise((resolve): void => {
    setTimeout(resolve, ms);
  });
}
