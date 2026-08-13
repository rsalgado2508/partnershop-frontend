export function trackByKey<T extends { id: string }>(_index: number, item: T): string {
  return item.id;
}
