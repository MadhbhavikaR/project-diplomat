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

export const loadDemoComponentData = async <T>(
  componentName: string,
  fallback: T,
  fileName: string = `${componentName}.json`
): Promise<T> => loadDemoData<T>(fileName, fallback)

export const loadDemoComponentSequence = async <T>(
  componentName: string,
  maxFiles = 50
): Promise<T[]> => loadDemoSequence<T>(componentName, maxFiles)

export const loadDemoSequence = async <T>(pathPrefix: string, maxFiles = 50): Promise<T[]> => {
  const cacheKey = `sequence:${pathPrefix}`
  try {
    if (!demoCache.has(cacheKey)) {
      demoCache.set(
        cacheKey,
        (async () => {
          const items: T[] = []
          for (let index = 1; index <= maxFiles; index += 1) {
            const response = await fetch(`/demo/${pathPrefix}/${index}.json`)
            if (!response.ok) {
              break
            }
            items.push(await response.json() as T)
          }
          return items
        })()
      )
    }

    return (await demoCache.get(cacheKey)) as T[]
  } catch (error) {
    console.error('Failed to load demo sequence', error)
    return []
  }
}
