import fs from 'node:fs'

import { getFilePath, isUndefined, getAllDirFileContent } from './shared'

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
    }) => Promise<void>
  }[]
}

export interface TransformImage<R = 'png' | 'jpg', F = 'webp' | 'svg'> {
  entry: {
    imageDir: string
    contentDir?: string
  }

  outputRootDir: string

  rules: Rule<R, F>[]

  mkdir?: boolean
}

async function handleImage(
  imagePaths: string[],
  {
    outputRootDir,
    rules,
    mkdir
  }: {
    outputRootDir: string
    rules: Rule[]
    mkdir?: boolean
  }
) {
  const pathInfoList: { entryPath: string; outputPath: string }[] = []
  const queuePendingList: Promise<any>[] = []

  for (const path of imagePaths) {
    console.log(`正在处理: ${path}`)

    const outPathFragment = path
      .replace('D:/CoderHXL/spyx-next-web/public', outputRootDir)
      .split('/')
    const outDir = outPathFragment
      .slice(0, outPathFragment.length - 1)
      .join('/')

    if (mkdir) fs.mkdirSync(outDir, { recursive: true })

    const pending = fs.promises.stat(path).then(async (res) => {
      const size = res.size / 1000
      const rule = rules.find((v) => path.endsWith(v.name))
      if (!rule) return

      const { name: rawName, format } = rule

      const handlePendingList: Promise<void>[] = []
      for (const item of format) {
        const { name: formatName, min, max, handle } = item

        if (
          (isUndefined(max) || (!isUndefined(max) && size < max)) &&
          (isUndefined(min) || (!isUndefined(min) && size > min))
        ) {
          const outputPath = outPathFragment
            .join('/')
            .replace(rawName, formatName)

          const handlePending = handle({
            rawName,
            formatName,
            entryPath: path,
            outputPath,
            size
          })

          // 存储 entryPath 和 outputPath , 为后续替换文件资源位置做准备
          pathInfoList.push({ entryPath: path, outputPath })

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
  const { entry, outputRootDir, rules, mkdir } = config
  const startTime = Date.now()

  console.log('图片任务开始')

  let allContent = ''
  if (!isUndefined(entry.contentDir))
    allContent = await getAllDirFileContent(entry.contentDir)

  const ruleNames = rules.map((v) => v.name)
  const imagePaths = getFilePath(
    entry.imageDir,
    (v) =>
      !!ruleNames.find((n) => v.endsWith(`.${n}`)) &&
      (isUndefined(entry.contentDir) ||
        allContent.includes(v.replaceAll(entry.imageDir, '')))
  )

  console.log(`图片数量: ${imagePaths.length}`)

  const pathInfoList = await handleImage(imagePaths, {
    outputRootDir,
    rules,
    mkdir
  })

  const endTime = Date.now()
  console.log(`图片任务结束 耗时: ${(endTime - startTime) / 1000}s`)

  return pathInfoList
}
