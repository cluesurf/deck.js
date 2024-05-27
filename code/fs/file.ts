export const isExecutableMode = (mode: number): boolean =>
  (mode & 0o111) === 0o111
