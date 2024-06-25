import fs from 'node:fs'
import { getAllDirFileContentAndPath } from './shared'

interface ReplaceFileContent {
  entry: string

  list: { searchValue: string; replaceValue: string }[]
}

export default async function replaceFileContent(config: ReplaceFileContent) {
  const { entry, list } = config
  const startTime = Date.now()

  console.log('替换任务开始')

  const fileInfo = await getAllDirFileContentAndPath(entry)

  for (const item of list) {
    const { searchValue, replaceValue } = item

    for (const cItem of fileInfo) {
      const { path, content } = cItem
      if (!content.includes(searchValue)) continue

      console.log('正在处理: ', path)

      const newContent = content.replaceAll(searchValue, replaceValue)

      await fs.promises.writeFile(path, newContent)
    }
  }

  const endTime = Date.now()
  console.log(`替换任务结束 耗时: ${(endTime - startTime) / 1000}s`)
}
