# batch-handle-resource

用于批量处理资源。

- transformImage 批量图片处理
- replaceFileContent 批量文件替换内容

### transformImage

批量图片处理

#### 参数

##### TransformImage

| 选项 | 类型 | 描述 |
| --- | --- | --- |
| entry | string | 图片入口目录 |
| output | string | 图片出口目录 |
| rules | Rule[] | 匹配图片规则 |
| useFile | UseFile | 匹配被文件内用到的图片 |
| mkdir | boolean | 是否创建文件夹 |
| logFileGeneratePath | string | 日志文件存储路径 |
| itemLog | boolean | 是否将每项的路径打印 |

##### Rule

| 选项 | 类型 | 描述 |
| --- | --- | --- |
| name | 'png' or 'jpg' | 匹配的图片格式 |
| format | Format | 如何处理 |

#### Format

| 选项 | 类型 | 描述 |
| --- | --- | --- |
| name | 'webp' or 'svg' | 要转变的图片格式 |
| max | number | 图片的最大体质 |
| min | number | 图片的最小体积 |
| handle | (info: { rawName: R, formatName: F, entryPath: string, outputPath: string, size: number }) => Promise<any> | 处理函数 |

#### UseFile

| 选项 | 类型 | 描述 |
| --- | --- | --- |
| dir | string | 文件入口目录 |
| imageInFileAlias | Record<any, any> | 图片在文件内的别名 |

### replaceFileContent

批量文件替换内容

#### 参数

##### ReplaceFileContent 

| 选项 | 类型 | 描述 |
| --- | --- | --- |
| entry | string | 文件入口目录 |
| list | ReplaceInfo[] | 替换选项 |
| logFileGeneratePath | string | 日志文件存储路径 |
| itemLog | boolean | 是否将每项的路径打印 |

##### ReplaceInfo  

| 选项 | 类型 | 描述 |
| --- | --- | --- |
| searchValue | string | 匹配值 |
| replaceValue | List | 替换值 |


