const fs = require('fs')
const path = require('path')
const leasot = require('leasot')
const glob = require('glob')

glob('**/*.{js,hbs,sh,ts,html,css,yml}', {
  'ignore': ['node_modules/**/*', 'dist/**/*', 'env/**/*', 'docs/docs/**/*']
}, (err, files) => {
  if (err) throw err

  /**
   * All found occurences of any source code tags
   * @type {{ file: string; tag: string; line: number; text: string}[]} entry Entry
   */
  const mappedFiles = files
    .map(file => {
      const fileContents = fs.readFileSync(file, 'utf8')
      // get the filetype of the file, or force a special parser
      const fileType = path.extname(file)
      // add file for better reporting
      const todoParser = leasot.parse(fileContents, {
        extension: fileType,
        filename: file
      })
      return leasot.report(todoParser)
    })
    .reduce((a, b) => a.concat(b), [])

  /**
   * Render an entry
   * @param {{ file: string; tag: string; line: number; text: string}} entry Entry
   */
  const renderTag = entry => `| ${entry.tag} | ${entry.text} | ${path.extname(entry.file)} | [Link to ${path.basename(entry.file)}](https://github.com/AnonymerNiklasistanonym/IliasBuddyDesktop/blob/master/${entry.file}#L${entry.line}) |`

  const todoTags = mappedFiles.filter(a => a.tag === 'TODO')
    .map(renderTag).join('\n')
  const fixMeTags = mappedFiles.filter(a => a.tag === 'FIXME')
    .map(renderTag).join('\n')
  const otherTags = mappedFiles.filter(a => a.tag !== 'FIXME' && a.tag !== 'TODO')
    .map(renderTag).join('\n')

  fs.writeFile(path.join(__dirname, './docs/open-todos.md'),
    '# Open TODOs\n\n' +
    'In here you can find nearly all currently open FIXME and TODO tags in the code:\n\n' +
    '| Tag | Description | Type | Link |\n| --- | --- | --- | --- |\n' +
    [fixMeTags, todoTags, otherTags].join('\n'),
    err => { if (err) throw err })
})
