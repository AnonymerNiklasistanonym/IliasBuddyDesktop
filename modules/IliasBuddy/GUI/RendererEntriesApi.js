/* =====  Imports  ====== */

// npm modules
const Handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')

/* =====  Global constants  ====== */

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

// Register custom handlebars partials so that the following templates compile
const partialNames = [
  'partialCourseAndDirectory',
  'partialDescription',
  'partialLinkDate'
]
partialNames.forEach(registerPartial)

/**
 * Render template for an Ilias entry that could not be specified
 */
const templateOther = compileTemplate('templateOther')
/**
 * Render template for an Ilias entry that is a file update
 */
const templateFile = compileTemplate('templateFile')
/**
 * Render template for an Ilias entry that is a post
 */
const templatePost = compileTemplate('templatePost')

// TODO Seems not to work - Investigate further if time to use less memory
// Unregister the custom partials again, everything is already compiled
// partialNames.forEach(a => Handlebars.unregisterPartial(a))

/* =====  Module  ====== */

/**
 * Module to easily render Ilias entries
 */
class Renderer {
  /**
   * Render an Ilias entry
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
   * Render an Ilias entry via Handlebars templates
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

/* =====  Exports  ====== */

module.exports = Renderer
