const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')

const templateOther = handlebars.compile(fs.readFileSync(path.join(__dirname, 'templateOther.hbs')).toString())
const templateFile = handlebars.compile(fs.readFileSync(path.join(__dirname, 'templateFile.hbs')).toString())
const templatePost = handlebars.compile(fs.readFileSync(path.join(__dirname, 'templatePost.hbs')).toString())

class Renderer {
  /**
   * @param {import('../API/IliasBuddyApiTypes').IliasBuddyApi.Entry} entry
   * @returns {HTMLLIElement}
   */
  static render (entry) {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = this.renderElementHbs(entry)
    return wrapper.firstChild
  }
  /**
   * @param {import('../API/IliasBuddyApiTypes').IliasBuddyApi.Entry} entry
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
  /**
   * @param {import('../API/IliasBuddyApiTypes').IliasBuddyApi.Entry} entry
   * @returns {HTMLLIElement}
   */
  static renderOther (entry) {
    const whoops = document.createElement('li')
    whoops.innerText = 'Whoops'
    return whoops
  }
  /**
   * @param {import('../API/IliasBuddyApiTypes').IliasBuddyApi.Entry} entry
   * @returns {HTMLLIElement}
   */
  static renderPost (entry) {
    const root = document.createElement('li')

    const course = document.createElement('p')
    course.innerText = 'Course:' + entry.course
    root.appendChild(course)

    const courseDirectory = document.createElement('p')
    courseDirectory.innerText = entry.courseDirectory === undefined ? 'Course directory undefined' : 'Course Directory:' + entry.courseDirectory.join(' >>> ')
    root.appendChild(courseDirectory)

    const timeTag = document.createElement('p')
    const time = document.createElement('time')
    time.setAttribute('datetime', '' + entry.date.unix)
    time.innerText = entry.date.humanReadable
    timeTag.innerHTML = 'Date: ' + time.outerHTML
    root.appendChild(timeTag)

    const link = document.createElement('a')
    link.href = entry.link
    link.setAttribute('target', '_blank')
    link.innerText = 'Link to entry'
    root.appendChild(link)

    const description = document.createElement('p')
    description.innerText = 'Description: ' + entry.description
    root.appendChild(description)

    const forum = document.createElement('p')
    forum.innerText = 'Forum: ' + entry.options.post.forum
    root.appendChild(forum)

    const title = document.createElement('p')
    title.innerText = 'Title: ' + entry.options.post.title
    root.appendChild(title)

    return root
  }
  /**
   * @param {import('../API/IliasBuddyApiTypes').IliasBuddyApi.Entry} entry
   * @returns {HTMLLIElement}
   */
  static renderFile (entry) {
    const root = document.createElement('li')

    const course = document.createElement('p')
    course.innerText = 'Course:' + entry.course
    root.appendChild(course)

    const courseDirectory = document.createElement('p')
    courseDirectory.innerText = entry.courseDirectory === undefined ? 'Course directory undefined' : 'Course Directory:' + entry.courseDirectory.join(' >>> ')
    root.appendChild(courseDirectory)

    const timeTag = document.createElement('p')
    const time = document.createElement('time')
    time.setAttribute('datetime', '' + entry.date.unix)
    time.innerText = entry.date.humanReadable
    timeTag.innerHTML = 'Date: ' + time.outerHTML
    root.appendChild(timeTag)

    const link = document.createElement('a')
    link.href = entry.link
    link.setAttribute('target', '_blank')
    link.innerText = 'Link to entry'
    root.appendChild(link)

    const description = document.createElement('p')
    description.innerText = 'Description: ' + entry.description
    root.appendChild(description)

    const fileName = document.createElement('p')
    fileName.innerText = 'File name: ' + entry.options.file.fileName
    root.appendChild(fileName)

    const fileState = document.createElement('p')
    if (entry.options.file.fileAdded) {
      fileState.innerText = 'State: Added'
    } else if (entry.options.file.fileUpdated) {
      fileState.innerText = 'State: Updated'
    } else {
      fileState.innerText = 'State: Unknown'
    }
    root.appendChild(fileState)

    return root
  }
}

module.exports = Renderer
