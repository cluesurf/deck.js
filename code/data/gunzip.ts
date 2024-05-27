import zlib, { InputType, ZlibOptions } from 'zlib'

export function gzip(input: InputType, options?: ZlibOptions) {
  return new Promise(function (resolve, reject) {
    const cb = function (error: Error | null, result: Buffer) {
      if (!error) {
        resolve(result)
      } else {
        reject(error)
      }
    }

    if (options) {
      zlib.gzip(input, options, cb)
    } else {
      zlib.gzip(input, cb)
    }
  })
}

export function gunzip(input: InputType, options?: ZlibOptions) {
  return new Promise(function (resolve, reject) {
    const cb = function (error: Error | null, result: Buffer) {
      if (!error) {
        resolve(result)
      } else {
        reject(error)
      }
    }

    if (options) {
      zlib.gunzip(input, options, cb)
    } else {
      zlib.gunzip(input, cb)
    }
  })
}
