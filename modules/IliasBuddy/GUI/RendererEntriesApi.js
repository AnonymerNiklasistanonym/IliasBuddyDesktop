const Handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')

const hbsTemplatePath = path.join(__dirname, 'templates')
const hbsPartialPath = path.join(hbsTemplatePath, 'partials')

/**
 * Register a handlebars partial in partial directory
 */
const registerPartial = partialName => {
  const filePath = path.join(hbsPartialPath, partialName + '.hbs')
  Handlebars.registerPartial(partialName, fs.readFileSync(filePath).toString())
}

/**
 * Compile a handlebars template in template directory
 * @returns {Handlebars.TemplateDelegate}
 */
const compileTemplate = templateName => {
  const filePath = path.join(hbsTemplatePath, templateName + '.hbs')
  return Handlebars.compile(fs.readFileSync(filePath).toString())
}

registerPartial('partialCourseAndDirectory')
registerPartial('partialDescription')
registerPartial('partialLinkDate')

const templateOther = compileTemplate('templateOther')
const templateFile = compileTemplate('templateFile')
const templatePost = compileTemplate('templatePost')

class Renderer {
  /**
   * @param {import('../PARSER/RawEntryParserTypes')
   * .IliasBuddyRawEntryParser.Entry} entry
   * @returns {string}
   */
  static render (entry) {
    return this.renderElementHbs({
      ...entry,
      hasCourseDirectory: entry.courseDirectory !== undefined &&
      entry.courseDirectory.length !== 0,
      hasDescription: entry.description !== undefined &&
      entry.description !== ''
    })
  }
  /**
   * @param {import('./RendererTypes').RenderEntry} entry
   * @returns {string}
   */
  static renderElementHbs (entry) {
    if (entry.options !== undefined) {
      if (entry.options.isFile) {
        return templateFile(entry)
      }
      if (entry.options.isPost) {
        return templatePost(entry)
      }
    }

    return templateOther(entry)
  }
}

module.exports = Renderer
