import fs from 'node:fs'
import { getAllDirFileContentAndPath, LogFileGenerate } from './shared'

const logFileGenerate = new LogFileGenerate(
  '文件内图片 URL 更新',
  '# 文件内图片 URL 更新',
  ['次数', '位置']
)

interface ReplaceFileContent {
  entry: string
  list: { searchValue: string; replaceValue: string }[]

  logFileGeneratePath?: string
  itemLog?: boolean
}

export default async function replaceFileContent(config: ReplaceFileContent) {
  const { entry, list, itemLog = true, logFileGeneratePath } = config
  const startTime = Date.now()

  console.log('替换文件内容任务开始')

  const fileInfoList = await getAllDirFileContentAndPath(entry)

  const replaceQueue: { path: string; content: string }[] = []
  for (const item of list) {
    const { searchValue, replaceValue } = item

    for (const fileInfo of fileInfoList) {
      const { content } = fileInfo
      if (!content.includes(searchValue)) continue

      fileInfo.content = content.replaceAll(searchValue, replaceValue)

      replaceQueue.push(fileInfo)
    }
  }

  console.log(`文件数量: ${replaceQueue.length}`)

  // 替换文件内容
  let i = 0
  for (const fileInfo of replaceQueue) {
    const { path, content } = fileInfo

    if (itemLog) console.log('正在替换: ', path)

    if (!logFileGenerate.content.includes(path)) {
      logFileGenerate.addRow([++i, path])
    }

    await fs.promises.writeFile(path, content)
  }

  logFileGenerate.generate(logFileGeneratePath)

  const endTime = Date.now()
  console.log(`替换文件内容任务结束 耗时: ${(endTime - startTime) / 1000}s`)
}
