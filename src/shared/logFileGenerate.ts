import fs from 'node:fs'

export class LogFileGenerate {
  private name: string
  content = ''

  constructor(name: string, title: string, header: string[]) {
    this.name = name

    this.content += `${title}\n`

    this.content += `| ${header.join(' | ')} |\n`
    this.content += `| ${header.map((v) => '-----').join(' | ')} |\n`
  }

  addRow(row: (string | number)[]) {
    this.content += `| ${row.join(' | ')} |\n`
  }

  async generate(path?: string) {
    await fs.promises.writeFile(
      `${path}/${this.name}-${Date.now()}.md`,
      this.content
    )
  }
}
