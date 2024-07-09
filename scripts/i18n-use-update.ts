import matcher, {
  filterByContent,
  insertToLastImport,
  replaceContent,
  log,
  Context
} from '../src/matcher'

// default: en
const local = ['de', 'es', 'fr', 'it', 'jp', 'kr', 'pt']

export function customInsertToLastImport(
  insertValue: string
): (context: Context) => Promise<Context> {
  return async (context: Context) => {
    const endPath = local.find((v) => context.path.includes(v)) ?? 'en'
    insertValue += endPath

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

const importStr = `
import {
  headerDictionaries,
  headerStyles
} from 'src/components/i18n/header/config/i18n/'\n
`

const logTitle = `# page - 更新组件路径和 Props
**import Header from "src/components/Header/Header" => import Header from "src/components/i18n/header"**
`

matcher({
  entry: 'e:/HXL/工具/batch-handle-resource/test/data',
  rules: [
    {
      match: /\.js$/,
      use: [
        filterByContent('import Header from "src/components/Header/Header"'),
        customInsertToLastImport(importStr),
        replaceContent(
          [
            {
              searchValue: 'import Header from "src/components/Header/Header"',
              replaceValue: 'import Header from "src/components/i18n/header"'
            },
            {
              searchValue: '<Header />',
              replaceValue:
                '<Header dictionaries={headerDictionaries} styles={headerStyles} />'
            }
          ],
          false
        ),
        log({
          name: 'page-更新组件路径和Props',
          title: logTitle,
          header: ['次数', '路径'],
          storePath: 'e:/HXL/工具/batch-handle-resource/log'
        })
      ]
    }
  ]
})
