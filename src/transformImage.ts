import fs from 'node:fs'

import {
  getFilePath,
  isUndefined,
  getAllDirFileContent,
  LogFileGenerate
} from './shared'

export interface Rule<R = 'png' | 'jpg', F = 'webp' | 'svg'> {
  name: R
  format: {
    name: F
    max?: number
    min?: number
    handle: (info: {
      rawName: R
      formatName: F
      entryPath: string
      outputPath: string
      size: number
    }) => Promise<any>
  }[]
}

export interface TransformImage<R = 'png' | 'jpg', F = 'webp' | 'svg'> {
  entry: string
  output: string

  rules: Rule<R, F>[]

  useFile?: {
    dir: string
    imageInFileAlias?: Record<any, any>
  }

  mkdir?: boolean
  logFileGeneratePath?: string
  itemLog?: boolean
}

const logFileGenerate = new LogFileGenerate('图片优化对比', '# 图片优化对比', [
  '次数',
  '原',
  '新',
  '原大小',
  '新大小'
])

async function handleImage(
  imagePaths: string[],
  options: {
    entryRootDir: string
    outputRootDir: string
    rules: Rule[]
    mkdir?: boolean
    itemLog?: boolean
  }
) {
  const { entryRootDir, outputRootDir, rules, mkdir, itemLog } = options

  const pathInfoList: { entryPath: string; outputPath: string }[] = []
  const queuePendingList: Promise<any>[] = []

  let i = 0
  for (const entryPath of imagePaths) {
    if (itemLog) console.log(`正在处理: ${entryPath}`)

    const outDirPathFragment = entryPath
      .replace(entryRootDir, outputRootDir)
      .split('/')
    const outDir = outDirPathFragment
      .slice(0, outDirPathFragment.length - 1)
      .join('/')

    if (mkdir) fs.mkdirSync(outDir, { recursive: true })

    const pending = fs.promises.stat(entryPath).then(async (res) => {
      const size = res.size / 1000
      const rule = rules.find((v) => entryPath.endsWith(v.name))
      if (!rule) return

      const { name: rawName, format } = rule

      const handlePendingList: Promise<void>[] = []
      for (const item of format) {
        const { name: formatName, min, max, handle } = item

        if (
          (isUndefined(max) || (!isUndefined(max) && size < max)) &&
          (isUndefined(min) || (!isUndefined(min) && size > min))
        ) {
          const outputPath = outDirPathFragment
            .join('/')
            .replace(rawName, formatName)

          const handlePending = handle({
            rawName,
            formatName,
            entryPath,
            outputPath,
            size
          }).then((buffer: Buffer) => {
            const newSize = buffer.length / 1000

            // 日志
            logFileGenerate.addRow([
              ++i,
              entryPath,
              outputPath,
              `${size}KB`,
              `${newSize}KB`
            ])
          })

          // 存储 entryPath 和 outputPath , 可以为后续替换文件资源位置做准备
          pathInfoList.push({ entryPath: entryPath, outputPath })

          handlePendingList.push(handlePending)
        }
      }

      return Promise.all(handlePendingList)
    })

    queuePendingList.push(pending)
  }

  await Promise.all(queuePendingList)
  return pathInfoList
}

export default async function transformImage(config: TransformImage) {
  const {
    entry,
    output,
    rules,
    mkdir,
    useFile,
    itemLog = true,
    logFileGeneratePath
  } = config
  const startTime = Date.now()

  console.log('图片任务开始')

  let allContent = ''
  if (!isUndefined(useFile?.dir))
    allContent = await getAllDirFileContent(useFile?.dir)

  const ruleNames = rules.map((v) => v.name)
  const imagePaths = getFilePath(entry, (filePath) => {
    const isWellFormed = !!ruleNames.find((n) => filePath.endsWith(`.${n}`))

    if (!isWellFormed) return false

    let isHave = isUndefined(useFile?.dir)
    if (!isHave) {
      let inContentURL = filePath

      // 别名
      if (!isUndefined(useFile?.imageInFileAlias)) {
        for (const startName in useFile.imageInFileAlias) {
          const newStartName = useFile.imageInFileAlias[startName]

          if (filePath.startsWith(startName)) {
            inContentURL = filePath.replace(startName, newStartName)
          }
        }
      }

      // 存在
      if (allContent.includes(inContentURL)) {
        isHave = true
      }
    }

    return isWellFormed && isHave
  })

  console.log(`图片数量: ${imagePaths.length}`)

  const pathInfoList = await handleImage(imagePaths, {
    entryRootDir: entry,
    outputRootDir: output,
    rules,
    mkdir,
    itemLog
  })

  const endTime = Date.now()
  console.log(`图片任务结束 耗时: ${(endTime - startTime) / 1000}s`)

  // 生成日志
  logFileGenerate.generate(logFileGeneratePath)

  return pathInfoList
}
