import fs from 'fs'

import { Context } from './'
import { LogFileGenerate } from '../shared'

export function filterByContent(
  includes: string | string[]
): (context: Context) => Promise<Context> {
  return async (context: Context) => {
    const targets = Array.isArray(includes) ? includes : [includes]
    context.isFilter = !targets.find((item) => context.content.includes(item))

    return context
  }
}

export function insertToLastImport(
  insertValue: string
): (context: Context) => Promise<Context> {
  return async (context: Context) => {
    if (!context.content.includes('import ')) {
      context.content = insertValue + context.content

      return context
    }

    const splitByImport = context.content
      .split('import ')
      .splice(1)
      .map((item) => 'import ' + item)

    const endChunk = splitByImport[splitByImport.length - 1]

    const regex = /['"]([^'"]+)['"]/
    const found = endChunk.match(regex)
    if (found) {
      const moduleName = found[0]
      const splitByModuleName = endChunk.split(moduleName)
      splitByModuleName[0] += moduleName + '\n'

      splitByImport[splitByImport.length - 1] = [
        splitByModuleName[0],
        insertValue,
        splitByModuleName[1]
      ].join('')
    }

    context.content = splitByImport.join('')

    return context
  }
}

export function replaceContent(
  replaceList: { searchValue: string | RegExp; replaceValue: string }[],
  isWiteFile: boolean = false
): (context: Context) => Promise<Context> {
  return async (context) => {
    for (const item of replaceList) {
      const { searchValue, replaceValue } = item
      context.content = context.content.replaceAll(searchValue, replaceValue)
    }

    if (isWiteFile) await fs.promises.writeFile(context.path, context.content)

    return context
  }
}

export function log(config: {
  name: string
  title: string
  header: string[]
  storePath: string
}): (context: Context) => Promise<Context> {
  const logFile = new LogFileGenerate(config.name, config.title, config.header)

  let i = 0
  let id: undefined | NodeJS.Timeout = undefined
  return async (context) => {
    logFile.addRow([++i, context.path])

    if (id) {
      clearTimeout(id)
    }
    id = setTimeout(() => {
      logFile.generate(config.storePath)
    }, 500)

    return context
  }
}
