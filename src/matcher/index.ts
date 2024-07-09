import { getFilePath, getFileContentAndPath } from '../shared'

export interface Context {
  path: string
  content: string
  isFilter: boolean
}

interface matcher {
  entry: string
  rules: {
    match: RegExp
    use: ((info: Context) => Promise<Context>)[]
  }[]
}

export default async function matcher(config: matcher) {
  const { entry, rules } = config

  const paths = getFilePath(
    entry,
    (filePath) => !!rules.find((n) => filePath.match(n.match))
  )

  const fileInfos = await getFileContentAndPath(paths)

  for (const fileInfo of fileInfos) {
    const { path, content } = fileInfo
    const rule = rules.find((n) => path.match(n.match))

    if (!rule) continue

    const context: Context = { path, content, isFilter: false }
    for (const fn of rule.use) {
      if (context.isFilter) break
      await fn(context)
    }
  }

  return paths
}

export * from './handle'
