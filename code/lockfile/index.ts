import { LOCKFILE, LOCKFILE_BRANCH } from '../constants'
import { getCurrentBranch } from '~/code/git'
import { stringifyGitBranchName } from '~/code/git/branch'

export type GetNecessaryLockfileNameInput = {
  useGitBranchLockfile?: boolean
  mergeGitBranchLockfiles?: boolean
}

export async function getNecessaryLockfileName({
  useGitBranchLockfile = false,
  mergeGitBranchLockfiles = false,
}: GetNecessaryLockfileNameInput = {}): Promise<string> {
  if (useGitBranchLockfile && !mergeGitBranchLockfiles) {
    const branch = await getCurrentBranch()

    if (branch) {
      return LOCKFILE_BRANCH.replace(
        /\{branch\}/,
        stringifyGitBranchName(branch),
      )
    }
  }

  return LOCKFILE
}
