import path from 'path'
import symlinkDir from 'symlink-dir'

export async function symlinkDependency({
  realDirectory,
  targetDirectory,
  importAs,
}: {
  realDirectory: string
  targetDirectory: string
  importAs: string
}): Promise<{ reused: boolean; warn?: string }> {
  const link = path.join(targetDirectory, importAs)
  return symlinkDir(realDirectory, link)
}
