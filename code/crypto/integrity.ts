import crypto from 'node:crypto'
import Kink from '@termsurf/kink'

import fs from 'fs'
import util from 'util'
import rimraf from '@zkochan/rimraf'

import path from 'path'
import ssri, { type IntegrityLike } from 'ssri'

import { parseJsonBufferSync } from '~/code/data/json'
import kink from '~/code/errors/definitions'
import { PkgNameVersionForm } from '~/code/types'

export const INTEGRITY_REGEX: RegExp = /^([^-]+)-([A-Za-z0-9+/=]+)$/

export type VerifyPackageIntegrityInputForm = {
  integrity: string
  pkg: PkgNameVersionForm
  buffer: Buffer
}

export function verifyPackageIntegrity({
  integrity,
  pkg,
  buffer,
}: VerifyPackageIntegrityInputForm): Kink | boolean {
  const [, algorithm, integrityHash] =
    integrity.match(INTEGRITY_REGEX) ?? []

  if (!algorithm || !integrityHash) {
    return kink('integrity_error', { pkg })
  }

  // Compensate for the possibility of non-uniform Base64 padding
  const normalizedRemoteHash: string = Buffer.from(
    integrityHash,
    'base64',
  ).toString('hex')

  const calculatedHash: string = crypto
    .createHash(algorithm)
    .update(buffer)
    .digest('hex')

  if (calculatedHash !== normalizedRemoteHash) {
    const provided = `${algorithm}-${Buffer.from(
      calculatedHash,
      'hex',
    ).toString('base64')}`

    return kink('integrity_validation_failed', {
      algorithm,
      expected: integrity,
      provided,
    })
  }

  return true
}

// We track how many files were checked during installation.
// It should be rare that a files content should be checked.
// If it happens too frequently, something is wrong.
// Checking a file's integrity is an expensive operation!
// @ts-expect-error
global['verifiedFileIntegrity'] = 0

export type VerifyResult = {
  passed: boolean
  manifest?: DependencyManifest
}

export type SideEffects = Record<
  string,
  Record<string, PackageFileInfo>
>

export type PackageFilesIndex = {
  // name and version are nullable for backward compatibility
  // the initial specs of pnpm store v3 did not require these fields.
  // However, it might be possible that some types of dependencies don't
  // have the name/version fields, like the local tarball dependencies.
  name?: string
  version?: string
  requiresBuild?: boolean

  files: Record<string, PackageFileInfo>
  sideEffects?: SideEffects
}

export function checkPkgFilesIntegrity(
  cafsDir: string,
  pkgIndex: PackageFilesIndex,
  readManifest?: boolean,
): VerifyResult {
  // It might make sense to use this cache for all files in the store
  // but there's a smaller chance that the same file will be checked twice
  // so it's probably not worth the memory (this assumption should be verified)
  const verifiedFilesCache = new Set<string>()
  const _checkFilesIntegrity = checkFilesIntegrity.bind(
    null,
    verifiedFilesCache,
    cafsDir,
  )
  const verified = _checkFilesIntegrity(pkgIndex.files, readManifest)
  if (!verified) {
    return { passed: false }
  }
  if (pkgIndex.sideEffects) {
    // We verify all side effects cache. We could optimize it to verify only the side effects cache
    // that satisfies the current os/arch/platform.
    // However, it likely won't make a big difference.
    for (const [sideEffectName, files] of Object.entries(
      pkgIndex.sideEffects,
    )) {
      const { passed } = _checkFilesIntegrity(files)
      if (!passed) {
        delete pkgIndex.sideEffects![sideEffectName]
      }
    }
  }
  return verified
}

function checkFilesIntegrity(
  verifiedFilesCache: Set<string>,
  cafsDir: string,
  files: Record<string, PackageFileInfo>,
  readManifest?: boolean,
): VerifyResult {
  let allVerified = true
  let manifest: DependencyManifest | undefined
  for (const [f, fstat] of Object.entries(files)) {
    if (!fstat.integrity) {
      throw new Error(`Integrity checksum is missing for ${f}`)
    }
    const filename = getFilePathByModeInCafs(
      cafsDir,
      fstat.integrity,
      fstat.mode,
    )
    const readFile = readManifest && f === 'package.json'
    if (!readFile && verifiedFilesCache.has(filename)) {
      continue
    }
    const verifyResult = verifyFile(filename, fstat, readFile)
    if (readFile) {
      manifest = verifyResult.manifest
    }
    if (verifyResult.passed) {
      verifiedFilesCache.add(filename)
    } else {
      allVerified = false
    }
  }
  return {
    passed: allVerified,
    manifest,
  }
}

type FileInfo = Pick<PackageFileInfo, 'size' | 'checkedAt'> & {
  integrity: string | ssri.IntegrityLike
}

function verifyFile(
  filename: string,
  fstat: FileInfo,
  readManifest?: boolean,
): VerifyResult {
  const currentFile = checkFile(filename, fstat.checkedAt)
  if (currentFile == null) {
    return { passed: false }
  }
  if (currentFile.isModified) {
    if (currentFile.size !== fstat.size) {
      rimraf.sync(filename)
      return { passed: false }
    }
    return verifyFileIntegrity(filename, fstat, readManifest)
  }
  if (readManifest) {
    return {
      passed: true,
      manifest: parseJsonBufferSync(
        gfs.readFileSync(filename),
      ) as DependencyManifest,
    }
  }
  // If a file was not edited, we are skipping integrity check.
  // We assume that nobody will manually remove a file in the store and create a new one.
  return { passed: true }
}

export function verifyFileIntegrity(
  filename: string,
  expectedFile: FileInfo,
  readManifest?: boolean,
): VerifyResult {
  // @ts-expect-error
  global['verifiedFileIntegrity']++
  try {
    const data = gfs.readFileSync(filename)
    const passed = Boolean(ssri.checkData(data, expectedFile.integrity))
    if (!passed) {
      gfs.unlinkSync(filename)
      return { passed }
    } else if (readManifest) {
      return {
        passed,
        manifest: parseJsonBufferSync(data) as DependencyManifest,
      }
    }
    return { passed }
  } catch (err: unknown) {
    switch (
      util.types.isNativeError(err) &&
      'code' in err &&
      err.code
    ) {
      case 'ENOENT':
        return { passed: false }
      case 'EINTEGRITY': {
        // Broken files are removed from the store
        gfs.unlinkSync(filename)
        return { passed: false }
      }
    }
    throw err
  }
}

function checkFile(
  filename: string,
  checkedAt?: number,
): { isModified: boolean; size: number } | null {
  try {
    const { mtimeMs, size } = fs.statSync(filename)
    return {
      isModified: mtimeMs - (checkedAt ?? 0) > 100,
      size,
    }
  } catch (err: unknown) {
    if (
      util.types.isNativeError(err) &&
      'code' in err &&
      err.code === 'ENOENT'
    ) {
      return null
    }
    throw err
  }
}

export const modeIsExecutable = (mode: number): boolean =>
  (mode & 0o111) === 0o111

export type FileType = 'exec' | 'nonexec' | 'index'

export function getFilePathByModeInCafs(
  cafsDir: string,
  integrity: string | IntegrityLike,
  mode: number,
): string {
  const fileType = modeIsExecutable(mode) ? 'exec' : 'nonexec'
  return path.join(
    cafsDir,
    contentPathFromIntegrity(integrity, fileType),
  )
}

export function getFilePathInCafs(
  cafsDir: string,
  integrity: string | IntegrityLike,
  fileType: FileType,
): string {
  return path.join(
    cafsDir,
    contentPathFromIntegrity(integrity, fileType),
  )
}

function contentPathFromIntegrity(
  integrity: string | IntegrityLike,
  fileType: FileType,
): string {
  const sri = ssri.parse(integrity, { single: true })
  return contentPathFromHex(fileType, sri.hexDigest())
}

export function contentPathFromHex(
  fileType: FileType,
  hex: string,
): string {
  const p = path.join(hex.slice(0, 2), hex.slice(2))
  switch (fileType) {
    case 'exec':
      return `${p}-exec`
    case 'nonexec':
      return p
    case 'index':
    default:
      return `${p}-index.json`
  }
}
