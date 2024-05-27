import crypto from 'node:crypto'
import concatStream from 'concat-stream'
import stripBom from 'strip-bom'
import isGzip from 'is-gzip'
import tar from 'tar-stream'
import kink from '~/code/errors/definitions'
import { TarballExtractMessageForm } from '../types'
import { verifyPackageIntegrity } from '../crypto/integrity'
import Kink from '@termsurf/kink'
import { gunzip } from '../data/gunzip'
import { createReadStream } from '../fs'

export async function addTarballToStore({
  buffer,
  cafsDir,
  integrity,
  filesIndexFile,
  pkg,
  readManifest,
}: TarballExtractMessageForm) {
  if (integrity) {
    const status = verifyPackageIntegrity({ integrity, pkg, buffer })

    if (status instanceof Kink) {
      return status
    }
  }

  if (!cafsCache.has(cafsDir)) {
    cafsCache.set(cafsDir, createCafs(cafsDir))
  }
  const cafs = cafsCache.get(cafsDir)!
  const { filesIndex, manifest } = cafs.addFilesFromTarball(
    buffer,
    true,
  )
  const { filesIntegrity, filesMap } = processFilesIndex(filesIndex)
  const requiresBuild = writeFilesIndexFile(filesIndexFile, {
    manifest: manifest ?? {},
    files: filesIntegrity,
  })
  return {
    status: 'success',
    value: { filesIndex: filesMap, manifest, requiresBuild },
  }
}

type AddFilesFromTarballInputForm = {
  path: string
  filter: (path: string) => boolean
}

export async function addFilesFromTarball({
  path,
  filter: _filter,
}: AddFilesFromTarballInputForm) {
  const extract = tar.extract()
  const filter = _filter ?? (() => true)
  const tarStream = createReadStream(path)

  tarStream.pipe(extract)

  for await (const entry of extract) {
    const { name: relativePath, mode, size } = entry.header

    if (!filter(relativePath)) {
      continue
    }

    const fileBuffer = await readTarFileStream(entry)

    if (readManifest && relativePath === 'package.json') {
      manifestBuffer = fileBuffer
    }
    filesIndex[relativePath] = {
      mode,
      size,
      ...addBufferToCafs(fileBuffer, mode),
    }
  }

  return {
    filesIndex,
    manifest: manifestBuffer
      ? (parseJsonBufferSync(manifestBuffer) as DependencyManifest)
      : undefined,
  }
}

export function parseJsonBufferSync(buffer: Buffer): unknown {
  return JSON.parse(stripBom(buffer.toString()))
}

function readTarFileStream(stream: tar.Entry) {
  return new Promise((res, rej) => {
    stream.pipe(concatStream(res)).on('error', rej)
  })
}
