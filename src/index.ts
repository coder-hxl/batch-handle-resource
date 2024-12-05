import fs from 'node:fs'
import sharp from 'sharp'

import transformImage from './transformImage'
import replaceFileContent from './replaceFileContent'

const BASE_PATH = 'E:/Project/msafely-next-web'
const ENTER_PATH = BASE_PATH + '/public'
const OUTPUT_PATH = BASE_PATH + '/public'
const FILE_ENTER_PATH = BASE_PATH + '/src'
const LOG_FILE_PATH = 'E:/log'

const errorList: { path: string; message: string }[] = []

async function start() {
  async function imageFormatWebp(entryPath: string, outputPath: string) {
    try {
      const buffer = await sharp(entryPath).toFormat('webp').toBuffer()
      await fs.promises.writeFile(outputPath, buffer)
      await fs.promises.unlink(entryPath)

      return buffer
    } catch (error: any) {
      errorList.push({ path: entryPath, message: error.message })
    }
  }

  // 图片处理
  const pathInfoList = await transformImage({
    entry: ENTER_PATH,
    output: OUTPUT_PATH,

    mkdir: true,
    logFileGeneratePath: LOG_FILE_PATH,

    useFile: { dir: FILE_ENTER_PATH, imageInFileAlias: { [ENTER_PATH]: '' } },

    rules: [
      {
        name: 'png',
        format: [
          {
            name: 'webp',
            handle: ({ entryPath, outputPath }) =>
              imageFormatWebp(entryPath, outputPath)
          }
        ]
      },
      {
        name: 'jpg',
        format: [
          {
            name: 'webp',
            handle: ({ entryPath, outputPath }) =>
              imageFormatWebp(entryPath, outputPath)
          }
        ]
      }
    ]
  })

  if (errorList.length) {
    console.log(`Error: list: ${errorList} - length: ${errorList.length} `)
  }

  const replaceInfo = pathInfoList.map((item) => ({
    searchValue: item.entryPath.replace(OUTPUT_PATH, ''),
    replaceValue: item.outputPath.replace(OUTPUT_PATH, '')
  }))

  // 更新文件内图片资源的 URL
  await replaceFileContent({
    entry: FILE_ENTER_PATH,
    list: replaceInfo,

    logFileGeneratePath: LOG_FILE_PATH
  })

  console.log('完成 - 图片转换以及更新路径')
}

start()
