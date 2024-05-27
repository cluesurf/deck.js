/**
 * 1. Git branch name may contains slashes, which is not allowed in filenames
 * 2. Filesystem may be case-insensitive, so we need to convert branch name to lowercase
 */
export function stringifyGitBranchName(
  branchName: string = '',
): string {
  return branchName.replace(/[^a-zA-Z0-9-_.]/g, '!').toLowerCase()
}
