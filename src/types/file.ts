export type GitFileStatus =
  | 'modified'
  | 'added'
  | 'deleted'
  | 'renamed'
  | 'untracked'
  | 'ignored'
  | 'clean'

export interface FileNode {
  path: string
  name: string
  type: 'file' | 'directory'
  size?: number
  modifiedAt?: Date
  children?: FileNode[]
  expanded?: boolean
  gitStatus?: GitFileStatus
}
