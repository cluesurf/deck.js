import pathResolver from 'path'

import {
  TakeDeckForm,
  FileMeshForm,
  DeckBaseForm,
  DeckMeshForm,
} from '~/code/types'

import { mkdir, writeFile } from '~/code/fs'

export default class DeckBase implements DeckBaseForm {
  home: string

  files: FileMeshForm

  links: DeckMeshForm

  constructor({ home }: TakeDeckForm) {
    this.home = pathResolver.resolve(home)
    this.links = {}
    this.files = {}
  }

  async writeFile({
    filePath,
    mode,
    content,
  }: {
    filePath: string
    mode?: number
    content: Buffer
  }) {
    await writeFile(filePath, content, { mode })
  }

  async makeFileDirectory(filePath: string) {
    const directory = pathResolver.dirname(filePath)

    if (!this.directories.has(directory)) {
      mkdir(directory, { recursive: true })
      this.directories.add(directory)
    }
  }
}
