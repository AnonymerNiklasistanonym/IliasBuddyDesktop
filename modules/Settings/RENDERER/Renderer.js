const Handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const CronJobHelper = require('../../CronJobHelper/API/CronJobHelper')

const hbsTemplatePath = path.join(__dirname, 'templates')
const hbsPartialPath = path.join(hbsTemplatePath, 'partials')

/**
 * Register a handlebars partial in partial directory
 * @param {string} partialName
 */
const registerPartial = partialName => {
  const filePath = path.join(hbsPartialPath, partialName + '.hbs')
  Handlebars.registerPartial(partialName, fs.readFileSync(filePath).toString())
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
registerPartial('partialValueCronJob')
registerPartial('partialSetReset')

const templatePassword = compileTemplate('templatePassword')
const templateText = compileTemplate('templateText')
const templateCronJob = compileTemplate('templateCronJob')
const templateToggle = compileTemplate('templateToggle')

/**
 * Settings renderer helper
 */
class Renderer {
  /**
   * Render a settings element
   * @param {import('../API/SettingsTypes').Modifiable
   * .SettingsObjectMerged} entry
   * @returns {string}
   */
  static render (entry) {
    return this.renderElementHbs(entry)
  }
  /**
   * Render a setting element via compiled handlebars templates
   * @param {import('../API/SettingsTypes')
   * .Modifiable.SettingsObjectMerged} entry
   * @returns {string}
   */
  static renderElementHbs (entry) {
    switch (entry.type) {
      case 'toggle':
        return templateToggle(entry)
      case 'text':
      case 'url':
        // TODO add settings option - "no default value as value"
        if (entry.id === 'userName' || entry.id === 'userUrl') {
          if (entry.value === entry.valueDefault) {
            entry.value = ''
          }
        }
        return templateText(entry)
      case 'cronJob':
        return templateCronJob({
          ...entry,
          cronJobExplanation: CronJobHelper
            .cronJobStringToHumanReadableString(entry.value,
              { use24HourTimeFormat: true })
        })
      case 'password':
        if (entry.id === 'userPassword') {
          if (entry.value === entry.valueDefault) {
            entry.value = ''
          }
        }
        return templatePassword(entry)
      default:
        throw Error(`Unknown type! (${entry.type}, ${JSON.stringify(entry)})`)
    }
  }
}

module.exports = Renderer
