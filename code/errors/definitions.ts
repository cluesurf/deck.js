import Kink from '@termsurf/kink'
import { PkgNameVersionForm } from '../types'

const host = '@termsurf/deck'

type Base = {
  integrity_error: {
    take: {
      pkg: PkgNameVersionForm
    }
  }
  integrity_validation_failed: {
    take: {
      algorithm: string
      expected: string
      provided: string
    }
  }
}

let CODE_INDEX = 1

const CODE = {
  integrity_error: CODE_INDEX++,
  integrity_validation_failed: CODE_INDEX++,
}

type Name = keyof Base

Kink.code(host, (code: number) => code.toString(16).padStart(4, '0'))

Kink.base(
  host,
  'integrity_error',
  (take: Base['integrity_error']['take']) => ({
    code: CODE.integrity_error,
    note: 'Package integrity error.',
    link: take.pkg,
  }),
)

Kink.base(
  host,
  'integrity_validation_failed',
  (take: Base['integrity_validation_failed']['take']) => ({
    code: CODE.integrity_validation_failed,
    note: 'Package validation failed.',
    link: take,
  }),
)

export default function kink<N extends Name>(
  form: N,
  link?: Base[N]['take'],
  siteCode?: number,
) {
  const kink = Kink.make(host, form, link)
  if (siteCode) {
    kink.siteCode = siteCode
  }
  return kink
}
