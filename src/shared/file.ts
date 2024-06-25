import fs from 'node:fs'

export function getFilePath(
  dir: string,
  filter?: (filePath: string) => boolean
) {
  const dirs = fs.readdirSync(dir, { recursive: true, withFileTypes: true })
  const transformToPaths = dirs.reduce((prev, v) => {
    if (v.isDirectory()) return prev

    let path = `${v.parentPath}/${v.name}`

    if (path.includes('\\')) {
      path = `${path.replaceAll('\\', '/')}`
    }

    if (filter && !filter(path)) return prev

    prev.push(path)

    return prev
  }, [] as string[])

  return transformToPaths
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
  const result: { path: string; content: string }[] = []

  const filePaths = getFilePath(dir)

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
