export type DeckHostForm = {
  // new (take: TakeDeckForm): DeckForm

  // link global package
  link: (take: TakeDeckLinkForm) => Promise<void>

  // save global package
  save: (take: TakeDeckLinkForm) => Promise<void>

  // verify global package
  test: (take: TakeDeckLinkForm) => Promise<boolean>

  // remove global package
  toss: (take: TakeDeckLinkForm) => Promise<void>
}

export type DeckForm = {
  // resolve file link
  find: (take: TakeDeckFindForm) => Promise<string | void>

  // link a package
  link: (take: TakeDeckLinkForm) => Promise<void>

  // install defined packages
  load: () => Promise<void>

  // add a package
  save: (take: TakeDeckLinkForm) => Promise<void>

  // verify a deck
  test: (take: TakeDeckLinkForm) => Promise<boolean>

  // remove a package
  toss: (take: TakeDeckLinkForm) => Promise<void>
}

export type TakeDeckFindForm = {
  base?: string
  file: string
}

export type TakeDeckLoadFileForm = {
  file: string
}

export type TakeDeckForm = {
  home: string
}

export type TakeDeckLinkForm = {
  link: string
  mark?: string
  site?: string
}

export type FileMeshForm = Record<string, FileLinkForm>

export type FileLinkForm = {
  file?: boolean
  links?: FileMeshForm
}

export type DeckMeshForm = Record<string, DeckLinkForm>

export type DeckLinkForm = {
  deck?: DeckForm
  links?: DeckMeshForm
}

export type DeckBaseForm = {
  home: string

  files: FileMeshForm

  links: DeckMeshForm
}

export type PkgNameVersionForm = {
  name?: string
  version?: string
}

export type TarballExtractMessageForm = {
  type: 'extract'
  buffer: Buffer
  cafsDir: string
  integrity?: string
  filesIndexFile: string
  readManifest?: boolean
  pkg: PkgNameVersionForm
}

export type Dependencies = Record<string, string>

export type PackageBin = string | { [commandName: string]: string }

export type PackageScripts = {
  [name: string]: string
} & {
  prepublish?: string
  prepare?: string
  prepublishOnly?: string
  prepack?: string
  postpack?: string
  publish?: string
  postpublish?: string
  preinstall?: string
  install?: string
  postinstall?: string
  preuninstall?: string
  uninstall?: string
  postuninstall?: string
  preversion?: string
  version?: string
  postversion?: string
  pretest?: string
  test?: string
  posttest?: string
  prestop?: string
  stop?: string
  poststop?: string
  prestart?: string
  start?: string
  poststart?: string
  prerestart?: string
  restart?: string
  postrestart?: string
  preshrinkwrap?: string
  shrinkwrap?: string
  postshrinkwrap?: string
}

export type PeerDependenciesMeta = {
  [dependencyName: string]: {
    optional?: boolean
  }
}

export type DependenciesMeta = {
  [dependencyName: string]: {
    injected?: boolean
    node?: string
    patch?: string
  }
}

export type PublishConfig = {
  directory?: string
  linkDirectory?: boolean
  executableFiles?: Array<string>
  registry?: string
} & Record<string, unknown>

type Version = string

type Pattern = string
export type TypesVersions = {
  [version: Version]: {
    [pattern: Pattern]: Array<string>
  }
}

export type BaseManifest = {
  name?: string
  version?: string
  bin?: PackageBin
  description?: string
  directories?: {
    bin?: string
  }
  files?: Array<string>
  dependencies?: Dependencies
  devDependencies?: Dependencies
  optionalDependencies?: Dependencies
  peerDependencies?: Dependencies
  peerDependenciesMeta?: PeerDependenciesMeta
  dependenciesMeta?: DependenciesMeta
  bundleDependencies?: Array<string> | boolean
  bundledDependencies?: Array<string> | boolean
  homepage?: string
  repository?: string | { url: string }
  scripts?: PackageScripts
  config?: object
  engines?: {
    node?: string
    npm?: string
    pnpm?: string
  }
  cpu?: Array<string>
  os?: Array<string>
  libc?: Array<string>
  main?: string
  module?: string
  typings?: string
  types?: string
  publishConfig?: PublishConfig
  typesVersions?: TypesVersions
  readme?: string
  keywords?: Array<string>
  author?: string
  license?: string
  exports?: Record<string, string>
}

export type DependencyManifest = {
  name: string
  version: string
} & BaseManifest

export type PackageExtension = Pick<
  BaseManifest,
  | 'dependencies'
  | 'optionalDependencies'
  | 'peerDependencies'
  | 'peerDependenciesMeta'
>

export type PeerDependencyRules = {
  ignoreMissing?: Array<string>
  allowAny?: Array<string>
  allowedVersions?: Record<string, string>
}

export type AllowedDeprecatedVersions = Record<string, string>

export type ProjectManifest = {
  packageManager?: string
  workspaces?: Array<string>
  pnpm?: {
    neverBuiltDependencies?: Array<string>
    onlyBuiltDependencies?: Array<string>
    onlyBuiltDependenciesFile?: string
    overrides?: Record<string, string>
    packageExtensions?: Record<string, PackageExtension>
    ignoredOptionalDependencies?: Array<string>
    peerDependencyRules?: PeerDependencyRules
    allowedDeprecatedVersions?: AllowedDeprecatedVersions
    allowNonAppliedPatches?: boolean
    patchedDependencies?: Record<string, string>
    updateConfig?: {
      ignoreDependencies?: Array<string>
    }
    auditConfig?: {
      ignoreCves?: Array<string>
    }
    requiredScripts?: Array<string>
    supportedArchitectures?: SupportedArchitectures
  }
  private?: boolean
  resolutions?: Record<string, string>
} & BaseManifest

export type PackageManifest = {
  deprecated?: string
} & DependencyManifest

export type SupportedArchitectures = {
  os?: Array<string>
  cpu?: Array<string>
  libc?: Array<string>
}
