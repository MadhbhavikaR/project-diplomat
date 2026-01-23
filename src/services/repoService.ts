import { apiClient } from './apiClient'
import type { FileNode } from '../types/file'
import { getViteEnv } from '../utils/vite-env'
import { getRuntimeConfig } from '../utils/runtime-config-util'
import { loadDemoData } from '../utils/demo-data'

export interface GitStatus {
  branch: string
  dirtyCount: number
  ahead: number
  behind: number
}

export interface GitBranchInfo {
  name: string
  current: boolean
}

interface DemoRepoStore {
  tree: FileNode[]
  files: Record<string, string>
}

interface DemoGitStatusStore extends GitStatus {}

let demoRepoStore: DemoRepoStore | null = null
let demoGitStatusStore: DemoGitStatusStore | null = null

const getDemoRepoStore = async (): Promise<DemoRepoStore> => {
  if (demoRepoStore) {
    return demoRepoStore
  }

  const tree = await loadDemoData<FileNode[]>('repo-tree.json', [])
  const files = await loadDemoData<Record<string, string>>('repo-files.json', {})
  demoRepoStore = { tree, files }
  return demoRepoStore
}

const getDemoGitStatusStore = async (): Promise<DemoGitStatusStore> => {
  if (demoGitStatusStore) {
    return demoGitStatusStore
  }

  const fallback: DemoGitStatusStore = {
    branch: 'demo/main',
    dirtyCount: 0,
    ahead: 1,
    behind: 0,
  }
  const demoStatus = await loadDemoData<DemoGitStatusStore>('git-status-bar.json', fallback)
  demoGitStatusStore = { ...fallback, ...demoStatus }
  return demoGitStatusStore
}

const addNodeToTree = (items: FileNode[], basePath: string, newNode: FileNode): FileNode[] => {
  if (!basePath) {
    return [...items, newNode]
  }

  return items.map((node) => {
    if (node.path === basePath && node.type === 'directory') {
      return {
        ...node,
        children: [...(node.children || []), newNode],
      }
    }

    if (node.children) {
      return {
        ...node,
        children: addNodeToTree(node.children, basePath, newNode),
      }
    }

    return node
  })
}

const renameNodeInTree = (items: FileNode[], oldPath: string, newPath: string): FileNode[] => {
  const rename = (node: FileNode): FileNode => {
    const shouldUpdate = node.path === oldPath || node.path.startsWith(`${oldPath}/`)
    const nextPath = shouldUpdate ? node.path.replace(oldPath, newPath) : node.path
    const nextName = node.path === oldPath ? newPath.split('/').pop() || node.name : node.name
    return {
      ...node,
      path: nextPath,
      name: nextName,
      children: node.children ? node.children.map(rename) : node.children,
    }
  }

  return items.map(rename)
}

const removeNodeFromTree = (items: FileNode[], targetPath: string): FileNode[] => {
  const filtered = items.filter(
    node => node.path !== targetPath && !node.path.startsWith(`${targetPath}/`)
  )
  return filtered.map((node) => ({
    ...node,
    children: node.children ? removeNodeFromTree(node.children, targetPath) : node.children,
  }))
}

class RepoService {
  async listTree(repoPath: string): Promise<FileNode[]> {
    const env = getViteEnv()
    const { repoApiBase } = getRuntimeConfig()
    if (getRuntimeConfig().demoMode) {
      const store = await getDemoRepoStore()
      return [...store.tree]
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return []
    }

    const search = new URLSearchParams({ path: repoPath })
    return apiClient.get<FileNode[]>(`${repoApiBase}/tree?${search}`)
  }

  async readFile(path: string): Promise<string> {
    const env = getViteEnv()
    const { repoApiBase } = getRuntimeConfig()
    if (getRuntimeConfig().demoMode) {
      const store = await getDemoRepoStore()
      return store.files[path] ?? ''
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return ''
    }

    const search = new URLSearchParams({ path })
    const response = await apiClient.get<{ content: string }>(`${repoApiBase}/file?${search}`)
    return response.content
  }

  async createFile(path: string): Promise<void> {
    const env = getViteEnv()
    const { repoApiBase } = getRuntimeConfig()
    if (getRuntimeConfig().demoMode) {
      const store = await getDemoRepoStore()
      const basePath = path.substring(0, path.lastIndexOf('/'))
      store.tree = addNodeToTree(store.tree, basePath, {
        path,
        name: path.split('/').pop() || path,
        type: 'file',
      })
      store.files[path] = ''
      const status = await getDemoGitStatusStore()
      status.dirtyCount += 1
      return
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return
    }

    await apiClient.post(`${repoApiBase}/file`, { path })
  }

  async createFolder(path: string): Promise<void> {
    const env = getViteEnv()
    const { repoApiBase } = getRuntimeConfig()
    if (getRuntimeConfig().demoMode) {
      const store = await getDemoRepoStore()
      const basePath = path.substring(0, path.lastIndexOf('/'))
      store.tree = addNodeToTree(store.tree, basePath, {
        path,
        name: path.split('/').pop() || path,
        type: 'directory',
        children: [],
      })
      return
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return
    }

    await apiClient.post(`${repoApiBase}/folder`, { path })
  }

  async deletePath(path: string): Promise<void> {
    const env = getViteEnv()
    const { repoApiBase } = getRuntimeConfig()
    if (getRuntimeConfig().demoMode) {
      const store = await getDemoRepoStore()
      store.tree = removeNodeFromTree(store.tree, path)
      Object.keys(store.files).forEach((filePath) => {
        if (filePath === path || filePath.startsWith(`${path}/`)) {
          delete store.files[filePath]
        }
      })
      const status = await getDemoGitStatusStore()
      status.dirtyCount = Math.max(0, status.dirtyCount - 1)
      return
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return
    }

    const search = new URLSearchParams({ path })
    await apiClient.delete(`${repoApiBase}/path?${search}`)
  }

  async renamePath(path: string, newPath: string): Promise<void> {
    const env = getViteEnv()
    const { repoApiBase } = getRuntimeConfig()
    if (getRuntimeConfig().demoMode) {
      const store = await getDemoRepoStore()
      store.tree = renameNodeInTree(store.tree, path, newPath)
      const updatedFiles: Record<string, string> = {}
      Object.entries(store.files).forEach(([filePath, content]) => {
        if (filePath === path || filePath.startsWith(`${path}/`)) {
          updatedFiles[filePath.replace(path, newPath)] = content
        } else {
          updatedFiles[filePath] = content
        }
      })
      store.files = updatedFiles
      return
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return
    }

    await apiClient.post(`${repoApiBase}/rename`, { path, newPath })
  }

  async getGitStatus(repoPath: string): Promise<GitStatus> {
    if (getRuntimeConfig().demoMode) {
      return getDemoGitStatusStore()
    }

    const { repoApiBase } = getRuntimeConfig()
    const search = new URLSearchParams({ path: repoPath })
    return apiClient.get<GitStatus>(`${repoApiBase}/git/status?${search}`)
  }

  async getGitBranches(repoPath: string): Promise<GitBranchInfo[]> {
    const env = getViteEnv()
    const { repoApiBase } = getRuntimeConfig()
    if (getRuntimeConfig().demoMode) {
      return [
        { name: 'demo/main', current: true },
        { name: 'demo/feature-canvas', current: false },
      ]
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return []
    }

    const search = new URLSearchParams({ path: repoPath })
    return apiClient.get<GitBranchInfo[]>(`${repoApiBase}/git/branches?${search}`)
  }

  async checkoutBranch(repoPath: string, branch: string): Promise<void> {
    const env = getViteEnv()
    const { repoApiBase } = getRuntimeConfig()
    if (getRuntimeConfig().demoMode) {
      return
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return
    }

    await apiClient.post(`${repoApiBase}/git/checkout`, { path: repoPath, branch })
  }

  async createBranch(repoPath: string, branch: string, checkout = true): Promise<void> {
    const env = getViteEnv()
    const { repoApiBase } = getRuntimeConfig()
    if (getRuntimeConfig().demoMode) {
      return
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return
    }

    await apiClient.post(`${repoApiBase}/git/branch`, { path: repoPath, branch, checkout })
  }

  async commit(repoPath: string, message: string, files: string[]): Promise<void> {
    if (getRuntimeConfig().demoMode) {
      return
    }

    const { repoApiBase } = getRuntimeConfig()
    await apiClient.post(`${repoApiBase}/git/commit`, { path: repoPath, message, files })
  }

  async reset(repoPath: string): Promise<void> {
    if (getRuntimeConfig().demoMode) {
      return
    }

    const { repoApiBase } = getRuntimeConfig()
    await apiClient.post(`${repoApiBase}/git/reset`, { path: repoPath })
  }

  async saveFile(path: string, content: string): Promise<void> {
    const env = getViteEnv()
    const { repoApiBase } = getRuntimeConfig()
    if (getRuntimeConfig().demoMode) {
      const store = await getDemoRepoStore()
      store.files[path] = content
      return
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return
    }

    await apiClient.post(`${repoApiBase}/file`, { path, content })
  }

  async addToCommit(repoPath: string, filePath: string): Promise<void> {
    const env = getViteEnv()
    const { repoApiBase } = getRuntimeConfig()
    if (getRuntimeConfig().demoMode) {
      return
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return
    }

    await apiClient.post(`${repoApiBase}/git/add`, { path: repoPath, file: filePath })
  }

  async removeFromCommit(repoPath: string, filePath: string): Promise<void> {
    const env = getViteEnv()
    const { repoApiBase } = getRuntimeConfig()
    if (getRuntimeConfig().demoMode) {
      return
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return
    }

    await apiClient.post(`${repoApiBase}/git/unstage`, { path: repoPath, file: filePath })
  }
}

export const repoService = new RepoService()
