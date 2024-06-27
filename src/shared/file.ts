import fs from 'node:fs'

export function getFilePath(
  dir: string,
  filter?: (filePath: string) => boolean
) {
  const dirs = fs.readdirSync(dir, { recursive: true, withFileTypes: true })
  const transformToPaths = dirs.reduce((prev, v) => {
    if (v.isDirectory()) return prev

    let filePath = `${v.parentPath}/${v.name}`

    if (filePath.includes('\\')) {
      filePath = filePath.replaceAll('\\', '/')
    }

    if (filter && !filter(filePath)) return prev

    prev.push(filePath)

    return prev
  }, [] as string[])

  return transformToPaths
}

export async function getFileContentAndPath(filePaths: string[]) {
  const result: { path: string; content: string }[] = []

  const promisePending: Promise<any>[] = []
  for (const filePath of filePaths) {
    const pending = fs.promises
      .readFile(filePath, { encoding: 'utf8' })
      .then((res) => result.push({ path: filePath, content: res }))

    promisePending.push(pending)
  }

  await Promise.all(promisePending)

  return result
}

export async function getAllDirFileContent(dir: string) {
  const filePaths = getFilePath(dir)

  let content = ''
  const promisePending: Promise<any>[] = []
  for (const filePath of filePaths) {
    const pending = fs.promises
      .readFile(filePath, { encoding: 'utf8' })
      .then((res) => {
        content += `${res} \n`
      })

    promisePending.push(pending)
  }

  await Promise.all(promisePending)

  return content
}

export async function getAllDirFileContentAndPath(dir: string) {
  const filePaths = getFilePath(dir)

  return await getFileContentAndPath(filePaths)
}
