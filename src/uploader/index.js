import EventControler from './taskControl.js'
import BaseFile from './file.js'
export default class BaseUploader {
  constructor(options) {
    this.options = options;
    this.uploadControler = new EventControler()
    this.baseFile = new BaseFile(this.uploadControler)
  }

  click () {
    this.baseFile.click()
  }
  upload () {
    this.baseFile.upload()
  }
}