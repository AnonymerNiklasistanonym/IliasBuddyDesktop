const Handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')

const hbsTemplatePath = path.join(__dirname, 'templates')
const hbsPartialPath = path.join(hbsTemplatePath, 'partials')

/**
 * Register a handlebars partial in partial directory
 */
const registerPartial = nameOfPartial => {
  const filePath = path.join(hbsPartialPath, nameOfPartial + '.hbs')
  Handlebars.registerPartial(nameOfPartial, fs.readFileSync(filePath).toString())
}

/**
 * Compile a handlebars template in template directory
 * @returns {Handlebars.TemplateDelegate}
 */
const compileTemplate = nameOfTemplate => {
  const filePath = path.join(hbsTemplatePath, nameOfTemplate + '.hbs')
  return Handlebars.compile(fs.readFileSync(filePath).toString())
}

registerPartial('partialTitleAndDescription')
registerPartial('partialValuePassword')
registerPartial('partialValueToggle')
registerPartial('partialValueText')
registerPartial('partialSetReset')

const templatePassword = compileTemplate('templatePassword')
const templateText = compileTemplate('templateText')
const templateToggle = compileTemplate('templateToggle')

class Renderer {
  /**
   *
   * @param {import('../API/SettingsTypes').Modifiable.SettingsObjectMerged} entry
   * @returns {string}
   */
  static render (entry) {
    return this.renderElementHbs(entry)
  }
  /**
   * @param {import('../API/SettingsTypes').Modifiable.SettingsObjectMerged} entry
   * @returns {string}
   */
  static renderElementHbs (entry) {
    switch (entry.type) {
      case 'toggle':
        return templateToggle(entry)
      case 'text':
      case 'url':
      case 'cronJob':
        return templateText(entry)
      case 'password':
        return templatePassword(entry)
      default:
        throw Error('Unknown type! (' + entry.type + ',' + JSON.stringify(entry) + ')')
    }
  }
}

module.exports = Renderer
