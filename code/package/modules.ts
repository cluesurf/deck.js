import util from 'util'
import { errorHasCode } from '~/code/errors/tests'
import { joinPath } from '~/code/fs/path'
import { readdir } from '~/code/fs'
import { Dirent } from 'fs'

export async function safelyReadModulesDirectory(
  directory: string,
): Promise<Array<string> | void> {
  try {
    return await readModulesDirectory({ directory })
  } catch (err: unknown) {
    if (!errorHasCode(err, 'ENOENT')) {
      throw err
    }
  }
}

async function readModulesDirectory({
  directory,
  scope,
}: {
  directory: string
  scope?: string
}): Promise<Array<string>> {
  const packageNames: Array<string> = []
  const parentDirectory = scope ? joinPath(directory, scope) : directory
  const [unscopedDirectories, scopedDirectories] =
    await readSubDirectories({
      directory: parentDirectory,
      scope: Boolean(scope),
    })

  unscopedDirectories.forEach(dir => {
    const packageName = scope ? `${scope}/${dir.name}` : dir.name
    packageNames.push(packageName)
  })

  await Promise.all(
    scopedDirectories.map(async dir => {
      const scopedPackageNames = await readModulesDirectory({
        directory,
        scope: dir.name,
      })
      packageNames.push(...scopedPackageNames)
      return
    }),
  )

  return packageNames
}

async function readSubDirectories({
  directory,
  scope,
}: {
  directory: string
  scope?: boolean
}): Promise<[Array<Dirent>, Array<Dirent>]> {
  const directories = await readdir(directory, {
    withFileTypes: true,
  })
  const unscopedDirectories: Array<Dirent> = []
  const scopedDirectories: Array<Dirent> = []

  directories
    .filter(dir => {
      if (dir.isFile() || dir.name[0] === '.') {
        return false
      }
      return true
    })
    .forEach(dir => {
      if (!scope && dir.name[0] === '@') {
        scopedDirectories.push(dir)
      } else {
        unscopedDirectories.push(dir)
      }
    })

  return [unscopedDirectories, scopedDirectories]
}
