import { getViteEnv } from '../utils/vite-env'

export type FeatureFlag = 'monaco' | 'gitPanel' | 'fileExplorer'

export interface FeatureFlags {
  monaco: boolean
  gitPanel: boolean
  fileExplorer: boolean
}

class FeatureFlagService {
  private flags: FeatureFlags = {
    monaco: getViteEnv().VITE_ENABLE_MONACO === 'true',
    gitPanel: getViteEnv().VITE_ENABLE_GIT_PANEL === 'true',
    fileExplorer: getViteEnv().VITE_ENABLE_FILE_EXPLORER === 'true',
  }

  getFlags(): FeatureFlags {
    return this.flags
  }

  isEnabled(flag: FeatureFlag): boolean {
    return this.flags[flag]
  }
}

export const featureFlagService = new FeatureFlagService()
