import matcher, {
  filterByContent,
  insertToLastImport,
  replaceContent,
  log,
  Context
} from '../src/matcher'

// default: en
const locals = ['de', 'es', 'fr', 'it', 'jp', 'kr', 'pt']

function customInsertToLastImport(
  rawImportStr: string
): (context: Context) => Promise<Context> {
  return async (context: Context) => {
    const pathSplit = context.path.split('/')
    const local = locals.find((l) => pathSplit.find((p) => l === p)) ?? 'en'
    const importStr = rawImportStr + local + "'\n"

    const splitContentByImport = context.content
      .split('import ')
      .splice(1)
      .map((item) => 'import ' + item)

    const endChunk = splitContentByImport[splitContentByImport.length - 1]

    const regex = /['"]([^'"]+)['"]/
    const found = endChunk.match(regex)
    if (found) {
      const moduleName = found[0]
      const splitByModuleName = endChunk.split(moduleName)
      splitByModuleName[0] += moduleName + '\n'

      splitContentByImport[splitContentByImport.length - 1] = [
        splitByModuleName[0],
        importStr,
        splitByModuleName[1]
      ].join('')
    }

    context.content = splitContentByImport.join('')

    return context
  }
}

function getReplaceImportHeader() {
  const otherLocalImport = locals.map(
    (local) => `src/components/${local}/Header/Header`
  )

  const replaceImportHeader = [
    'src/components/Header/Header',
    '../../Header/Header',
    '../../components/Header/Header',
    ...otherLocalImport
  ].map((searchValue) => ({
    searchValue,
    replaceValue: 'src/components/i18n/header'
  }))

  return replaceImportHeader
}

const importStr = `import {
  headerDictionaries,
  headerStyles
} from 'src/components/i18n/header/config/i18n/`

const logTitle = `# Header 组件 - 更新组件路径和 Props

**Header/Header => src/components/i18n/header**

由于项目内引用路径的引号没统一，可以不采用导入语句查找，而是通过导入路径查找
导入语句\`import Header from 'src/components/i18n/header'\`相比于导入路径会更严谨
`

matcher({
  entry: 'e:/Project/spyx-next-web/src',
  rules: [
    {
      match: /\.js$/,
      use: [
        filterByContent('/Header/Header'),
        customInsertToLastImport(importStr),
        replaceContent(
          [
            ...getReplaceImportHeader(),
            {
              searchValue: '<Header />',
              replaceValue:
                '<Header dictionaries={headerDictionaries} styles={headerStyles} />'
            },
            {
              searchValue: '<Header/>',
              replaceValue:
                '<Header dictionaries={headerDictionaries} styles={headerStyles} />'
            }
          ],
          true
        ),
        log({
          name: 'header组件-更新组件路径和Props',
          title: logTitle,
          header: ['次数', '路径'],
          storePath: 'e:/HXL/工具/batch-handle-resource/log'
        })
      ]
    }
  ]
})
