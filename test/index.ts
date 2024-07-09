import matcher, {
  filterByContent,
  insertToLastImport,
  replaceContent,
  log
} from '../src/matcher'

const importStr = `
import {
  headerDictionaries,
  headerStyles
} from 'src/components/i18n/header/config/i18n/en'\n
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
        insertToLastImport(importStr),
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
          true
        ),
        log({
          name: 'page-更新组件路径和Props',
          title: logTitle,
          header: ['次数', '路径'],
          storePath: 'e:/HXL/工具/batch-handle-resource/test'
        })
      ]
    }
  ]
})
