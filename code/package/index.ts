import {
  TakeDeckLinkForm,
  TakeDeckForm,
  TakeDeckFindForm,
  DeckForm,
  DeckHostForm,
  DeckBaseForm,
} from '~/code/types'

import { findFilePath } from '~/code/lifecycle/find'
import { installPackage } from '~/code/lifecycle/install'
import { addPackage, addPackageGlobally } from '~/code/lifecycle/add'
import {
  removePackage,
  removePackageGlobally,
} from '~/code/lifecycle/remove'
import {
  verifyPackage,
  verifyPackageGlobally,
} from '~/code/lifecycle/verify'
import { linkPackage, linkPackageGlobally } from '~/code/lifecycle/link'
import DeckBase from '~/code/package/implementation'

const DeckHost: DeckHostForm = {
  // save global package
  async save({ link, mark, site }: TakeDeckLinkForm) {
    return addPackageGlobally()
  },

  // remove global package
  async toss({ link, mark, site }: TakeDeckLinkForm) {
    return removePackageGlobally()
  },

  // verify global package
  async test({ link, mark, site }: TakeDeckLinkForm) {
    return verifyPackageGlobally()
  },

  // link global package
  async link({ link, mark, site }: TakeDeckLinkForm) {
    return linkPackageGlobally()
  },
}

export default class Deck implements DeckForm {
  static Host = DeckHost

  base: DeckBaseForm

  constructor({ home }: TakeDeckForm) {
    this.base = new DeckBase({ home })

    Object.defineProperty(this, 'base', {
      value: this.base,
      enumerable: false,
    })
  }

  // install defined packages
  async load() {
    return installPackage({ home: this.base.home })
  }

  // add a package
  async save({ link, mark, site }: TakeDeckLinkForm) {
    return addPackage()
  }

  // remove a package
  async toss({ link, mark, site }: TakeDeckLinkForm) {
    return removePackage()
  }

  // verify a deck
  async test({ link, mark, site }: TakeDeckLinkForm) {
    return verifyPackage()
  }

  // link a package
  async link({ link, mark }: TakeDeckLinkForm) {
    return linkPackage()
  }

  // resolve file link
  async find({ file, base }: TakeDeckFindForm) {
    return findFilePath({ base: base ?? this.base.home, file })
  }
}
