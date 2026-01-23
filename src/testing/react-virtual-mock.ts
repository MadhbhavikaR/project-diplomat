export const useVirtualizer = (options: { count: number }) => {
  const { count } = options
  return {
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        key: index,
        index,
        start: index * 96,
        size: 96,
        end: (index + 1) * 96,
        lane: 0,
      })),
    getTotalSize: () => count * 96,
    measureElement: () => undefined,
    scrollToIndex: () => undefined,
  }
}
