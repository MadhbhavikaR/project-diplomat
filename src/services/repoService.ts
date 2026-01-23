import { apiClient } from './apiClient'
import type { FileNode } from '../types/file'
import { getViteEnv } from '../utils/vite-env'

export interface GitStatus {
  branch: string
  dirtyCount: number
  ahead: number
  behind: number
}

class RepoService {
  async listTree(repoPath: string): Promise<FileNode[]> {
    const env = getViteEnv()
    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return []
    }

    const search = new URLSearchParams({ path: repoPath })
    return apiClient.get<FileNode[]>(`/repo/tree?${search}`)
  }

  async readFile(path: string): Promise<string> {
    const env = getViteEnv()
    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return ''
    }

    const search = new URLSearchParams({ path })
    const response = await apiClient.get<{ content: string }>(`/repo/file?${search}`)
    return response.content
  }

  async createFile(path: string): Promise<void> {
    await apiClient.post('/repo/file', { path })
  }

  async createFolder(path: string): Promise<void> {
    await apiClient.post('/repo/folder', { path })
  }

  async deletePath(path: string): Promise<void> {
    const search = new URLSearchParams({ path })
    await apiClient.delete(`/repo/path?${search}`)
  }

  async renamePath(path: string, newPath: string): Promise<void> {
    await apiClient.post('/repo/rename', { path, newPath })
  }

  async getGitStatus(repoPath: string): Promise<GitStatus> {
    const search = new URLSearchParams({ path: repoPath })
    return apiClient.get<GitStatus>(`/repo/git/status?${search}`)
  }

  async commit(repoPath: string, message: string, files: string[]): Promise<void> {
    await apiClient.post('/repo/git/commit', { path: repoPath, message, files })
  }

  async reset(repoPath: string): Promise<void> {
    await apiClient.post('/repo/git/reset', { path: repoPath })
  }
}

export const repoService = new RepoService()
