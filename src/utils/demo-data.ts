const demoCache = new Map<string, Promise<unknown>>()

export const loadDemoData = async <T>(path: string, fallback: T): Promise<T> => {
  try {
    if (!demoCache.has(path)) {
      demoCache.set(
        path,
        fetch(`/demo/${path}`).then(async (response) => {
          if (!response.ok) {
            throw new Error(`Demo data not found: ${path}`)
          }
          return response.json() as Promise<T>
        })
      )
    }

    return (await demoCache.get(path)) as T
  } catch (error) {
    console.error('Failed to load demo data', error)
    return fallback
  }
}
