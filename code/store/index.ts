import fs from 'fs'
import path from 'path'
import ssri from 'ssri'
import { verifyFileIntegrity } from './checkPkgFilesIntegrity'
import {
  generateTemporaryFilePath,
  optimisticRenameOverwrite,
} from '~/code/fs'
import Cache from './cache'

export default class Store {
  #cache: Cache

  #directories: Set<string>

  constructor() {
    this.#cache = new Cache()
    this.#directories = new Set()
  }
}

type WriteBufferToCafsInputForm = {
  buffer: Buffer
  fileDest: string
  mode: number | undefined
  integrity: ssri.IntegrityLike
}

type WriteBufferToCafsCall = (input: WriteBufferToCafsInputForm) => {
  checkedAt: number
  filePath: string
}

export function addBufferToCafs({
  writeBufferToCafs: WriteBufferToCafsCall,
  buffer: Buffer,
  mode: number,
}): FileWriteResult {
  // Calculating the integrity of the file is surprisingly fast.
  // 30K files are calculated in 1 second.
  // Hence, from a performance perspective, there is no win in fetching the package index file from the registry.
  const integrity = ssri.fromData(buffer)
  const isExecutable = modeIsExecutable(mode)
  const fileDest = contentPathFromHex(
    isExecutable ? 'exec' : 'nonexec',
    integrity.hexDigest(),
  )
  const { checkedAt, filePath } = writeBufferToCafs(
    buffer,
    fileDest,
    isExecutable ? 0o755 : undefined,
    integrity,
  )
  return { checkedAt, integrity, filePath }
}

export async function writeBufferToCafs(
  locker: Map<string, number>,
  cafsDir: string,
  buffer: Buffer,
  fileDest: string,
  mode: number | undefined,
  integrity: ssri.IntegrityLike,
): Promise<{ checkedAt: number; filePath: string }> {
  fileDest = path.join(cafsDir, fileDest)

  if (locker.has(fileDest)) {
    return {
      checkedAt: locker.get(fileDest)!,
      filePath: fileDest,
    }
  }

  // This part is a bit redundant.
  // When a file is already used by another package,
  // we probably have validated its content already.
  // However, there is no way to find which package index file references
  // the given file. So we should revalidate the content of the file again.
  if (existsSame(fileDest, integrity)) {
    return {
      checkedAt: Date.now(),
      filePath: fileDest,
    }
  }

  const temp = await generateTemporaryFilePath(fileDest)
  writeFile(temp, buffer, mode)
  const birthtimeMs = Date.now()
  await optimisticRenameOverwrite(temp, fileDest)
  locker.set(fileDest, birthtimeMs)
  return {
    checkedAt: birthtimeMs,
    filePath: fileDest,
  }
}

function removeSuffix(filePath: string): string {
  const dashPosition = filePath.indexOf('-')
  if (dashPosition === -1) {
    return filePath
  }
  const withoutSuffix = filePath.substring(0, dashPosition)
  if (filePath.substring(dashPosition) === '-exec') {
    return `${withoutSuffix}x`
  }
  return withoutSuffix
}

function existsSame(
  filename: string,
  integrity: ssri.IntegrityLike,
): boolean {
  const existingFile = fs.statSync(filename, { throwIfNoEntry: false })
  if (!existingFile) {
    return false
  }
  return verifyFileIntegrity(filename, {
    size: existingFile.size,
    integrity,
  }).passed
}
