import type { IntegrityLike } from 'ssri'
import type { DependencyManifest } from '~/code/types'

export type PackageFileInfo = {
  checkedAt?: number // Nullable for backward compatibility
  integrity: string
  mode: number
  size: number
}

export type ResolvedFrom = 'store' | 'local-dir' | 'remote'

export type PackageFilesResponse = {
  resolvedFrom: ResolvedFrom
  packageImportMethod?:
    | 'auto'
    | 'hardlink'
    | 'copy'
    | 'clone'
    | 'clone-or-copy'
  sideEffects?: Record<string, Record<string, PackageFileInfo>>
  requiresBuild: boolean
} & (
  | {
      unprocessed?: false
      filesIndex: Record<string, string>
    }
  | {
      unprocessed: true
      filesIndex: Record<string, PackageFileInfo>
    }
)

export type ImportPackageOpts = {
  disableRelinkLocalDirDeps?: boolean
  requiresBuild?: boolean
  sideEffectsCacheKey?: string
  filesResponse: PackageFilesResponse
  force: boolean
  keepModulesDir?: boolean
}

export type ImportPackageFunction = (
  to: string,
  opts: ImportPackageOpts,
) => { isBuilt: boolean; importMethod: undefined | string }

export type ImportPackageFunctionAsync = (
  to: string,
  opts: ImportPackageOpts,
) => Promise<{ isBuilt: boolean; importMethod: undefined | string }>

export type FileType = 'exec' | 'nonexec' | 'index'

export type FilesIndex = {
  [filename: string]: {
    mode: number
    size: number
  } & FileWriteResult
}

export type FileWriteResult = {
  checkedAt: number
  filePath: string
  integrity: IntegrityLike
}

export type AddToStoreResult = {
  filesIndex: FilesIndex
  manifest?: DependencyManifest
}

export type Cafs = {
  cafsDir: string
  addFilesFromDir: (dir: string) => AddToStoreResult
  addFilesFromTarball: (buffer: Buffer) => AddToStoreResult
  getFilePathInCafs: (
    integrity: string | IntegrityLike,
    fileType: FileType,
  ) => string
  getFilePathByModeInCafs: (
    integrity: string | IntegrityLike,
    mode: number,
  ) => string
  importPackage: ImportPackageFunction
  tempDir: () => Promise<string>
}
