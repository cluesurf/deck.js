export type PackageBinForm = string | { [commandName: string]: string }

export type DependenciesForm = Record<string, string>

export type ContributorForm = {
  name: string
  email?: string
  url?: string
}

export type PackageManifestForm = {
  host: string
  name: string
  version: string
  bin?: PackageBinForm
  description?: string
  website?: string
  repository?: string
  cpu?: Array<string>
  os?: Array<string>
  keywords?: Array<string>
  contributors?: Array<ContributorForm>
  license?: Array<string>
  private?: boolean
  document?: string
  files?: Array<string>
  entry?: string
  exports?: Record<string, string>
  dependencies?: DependenciesForm
  developmentDependencies?: DependenciesForm
  optionalDependencies?: DependenciesForm
  peerDependencies?: DependenciesForm
  bundledDependencies?: Array<string> | boolean
  deprecated?: string
}
