import util, { promisify } from 'util'
import _ from 'lodash'
import gfs from 'graceful-fs'
import fs, { ReadStream } from 'fs'
import renameOverwrite from 'rename-overwrite'
import path from 'path'
import { errorHasCode } from '../errors/tests'
import { getDirectoryName, joinPath } from './path'

export const copyFile = promisify(gfs.copyFile)
export const createReadStream = gfs.createReadStream
export const link = promisify(gfs.link)
export const readFile = promisify(gfs.readFile)
export const mkdir = promisify(gfs.mkdir)
export const readdir = promisify(gfs.readdir)
export const stat = promisify(gfs.stat)
export const exists = promisify(gfs.exists)
export const unlink = promisify(gfs.unlink)
export const writeFile = promisify(gfs.writeFile)
export const lstat = promisify(gfs.lstat)

export function readStream(stream: ReadStream) {
  return new Promise((res, rej) => {
    const chunks: Array<any> = []

    stream.on('data', (chunk: any) => {
      chunks.push(chunk)
    })

    // Send the buffer or you can put it into a var
    stream.on('end', () => {
      res(Buffer.concat(chunks))
    })

    stream.on('error', rej)
  })
}

export async function optimisticRenameOverwrite(
  temp: string,
  targetPath: string,
): Promise<void> {
  try {
    await renameOverwrite(temp, targetPath)
  } catch (err: unknown) {
    if (!errorHasCode(err, 'ENOENT')) {
      throw err
    }

    const exist = await exists(targetPath)

    if (!exist) {
      throw err
    }
  }
}

export async function hardLinkDirectory(
  src: string,
  destDirs: Array<string>,
): Promise<void> {
  if (destDirs.length === 0) {
    return
  }

  // Don't try to hard link the source directory to itself
  destDirs = destDirs.filter(
    destDir => path.relative(destDir, src) !== '',
  )

  await _hardLinkDirectory(src, destDirs, true)
}

async function _hardLinkDirectory(
  src: string,
  destDirs: Array<string>,
  isRoot?: boolean,
) {
  let files: Array<string>

  try {
    files = await readdir(src)
  } catch (err: unknown) {
    if (!isRoot || !errorHasCode(err, 'ENOENT')) {
      throw err
    }

    globalWarn(
      `Source directory not found when creating hardLinks for: ${src}. Creating destinations as empty: ${destDirs.join(
        ', ',
      )}`,
    )

    for (const dir of destDirs) {
      await mkdir(dir, { recursive: true })
    }

    return
  }

  if (files) {
    for (const file of files) {
      if (file === 'node_modules') {
        continue
      }

      const sourcePath = joinPath(src, file)
      const stat = await lstat(sourcePath)

      if (stat.isDirectory()) {
        const destSubdirs = destDirs.map(destDir => {
          const destSubdir = path.join(destDir, file)
          try {
            fs.mkdirSync(destSubdir, { recursive: true })
          } catch (err: unknown) {
            if (!errorHasCode(err, 'EEXIST')) {
              throw err
            }
          }
          return destSubdir
        })
        _hardLinkDirectory(sourcePath, destSubdirs)
        continue
      }

      for (const destDir of destDirs) {
        const targetPath = path.join(destDir, file)
        try {
          await linkOrCopyFile(sourcePath, targetPath)
        } catch (err: unknown) {
          if (errorHasCode(err, 'ENOENT')) {
            // Ignore broken symlinks
            continue
          }
          throw err
        }
      }
    }
  }
}

async function linkOrCopyFile(
  sourcePath: string,
  targetPath: string,
): Promise<void> {
  try {
    await linkOrCopy(sourcePath, targetPath)
  } catch (err: unknown) {
    if (errorHasCode(err, 'ENOENT')) {
      const directory = getDirectoryName(targetPath)
      await mkdir(directory, { recursive: true })
      await linkOrCopy(sourcePath, targetPath)
    } else if (!errorHasCode(err, 'EEXIST')) {
      throw err
    }
  }
}

/*
 * This function could be optimized because we don't really need to try linking again
 * if linking failed once.
 */
async function linkOrCopy(
  sourcePath: string,
  targetPath: string,
): Promise<void> {
  try {
    await link(sourcePath, targetPath)
  } catch (err: unknown) {
    if (!errorHasCode(err, 'EXDEV')) {
      throw err
    }
    await copyFile(sourcePath, targetPath)
  }
}
