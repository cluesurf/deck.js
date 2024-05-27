import { getRandomId } from '../data/ids'
import tmp, { tmpName } from 'tmp-promise'
import _ from 'lodash'
import { tmpdir } from 'os'
import pathResolver from 'path'
import normalizePath from 'normalize-path'
// import { temporaryFile, temporaryDirectory } from 'tempy'

export { normalizePath }

export function getDirectoryName(path: string) {
  return pathResolver.dirname(normalizePath(path))
}

export function joinPath(...fragments: Array<string>) {
  return normalizePath(pathResolver.join(...fragments))
}

export async function generateTemporaryFilePath(extension?: string) {
  return generateFilePath(tmpdir(), extension)
}

export async function generateFilePath(
  directory: string,
  extension?: string,
) {
  const name = getRandomId(64)
  const fullName = extension ? `${name}.${extension}` : name
  const path = await tmpName({ tmpdir: directory, name: fullName })
  return path
}

export async function generateDirectoryPath(directory: string) {
  const name = getRandomId(64)
  const { path } = await tmp.dir({ tmpdir: directory, name })
  return path
}

export async function generateTemporaryDirectoryPath() {
  return await generateDirectoryPath(tmpdir())
}
