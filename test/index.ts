import fs from 'node:fs'
import sharp from 'sharp'

import transformImage from '../src/transformImage'
import replaceFileContent from '../src/replaceFileContent'
import { getFileContentAndPath, getFilePath } from '../src/shared'

const BASE_PATH = 'd:/CoderHXL/轮子/batch-handle-resource/test/webp'

async function start() {
  const imagePaths = getFilePath(BASE_PATH)

  const filePaths = getFilePath(
    'd:/CoderHXL/Project/spyx-next-web/src',
    (filePath) => {
      const targets = [
        'contacts',
        'track-call',
        'track-email',
        'track-sim',
        'track-instagram',
        'track-snapchat',
        'track-kik',
        'track-line',
        'track-skype',
        'track-tinder',
        'track-viber',
        'track-wechat',
        'track-hangouts',
        'track-keylogger'
      ]
      console.log(filePath)

      return !!targets.find(
        (v) => filePath.includes('features') && filePath.includes(v)
      )
    }
  )

  const list = imagePaths.map((v) => {
    const name = v.split('/').pop()!
    const startName = name.split('-')[0]!

    const searchValue = `/image/features/${startName}.webp`
    const replaceValue = `/image/features/${name}`

    return { searchValue, replaceValue }
  })

  const fileInfoList = await getFileContentAndPath(filePaths)
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

  // 替换文件内容
  for (const fileInfo of replaceQueue) {
    const { path, content } = fileInfo

    await fs.promises.writeFile(path, content)
  }

  console.log(imagePaths)
  console.log(filePaths, fileInfoList.length)

  console.log('完成 - 图片转换以及更新路径')
}

start()
