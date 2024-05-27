import util from 'util'

export function errorHasCode(err: unknown, code: string) {
  return (
    util.types.isNativeError(err) && 'code' in err && err.code === code
  )
}
