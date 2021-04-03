import Chunk from './chunk.js'
export default class BaseFile {
  constructor(uploadControler) {
    this.files = this.files || (this.files = []);
    this.initFile();
    this.uploadControler = uploadControler
  }
  initFile (node) {
    const input = this.input = document.createElement('input');
    input.style.display = `none`;
    input.setAttribute('type', 'file')
    if (node) {
      if (node.tagName === 'INPUT' && node.type === 'file') {
        node.appendChild(input)
      } else {
        node = input
      }
      node.addEventListener('click', ev => {
        this.click(input)
      })
    } else {
      document.body.appendChild(input)
    }

    input.addEventListener('change', ev => {
      this.files = ev.target.files
      console.log(ev, this.files);
      this.file = new Chunk(this.files[0], {}, this.uploadControler)
    })
  }
  click (input = this.input) {
    input.click()
  }
  addFile (file) {
    this.files.push(file)
  }

  upload () {
    console.log('file upload')
    this.uploadControler.trigger('uploadChunks', null, 3)
  }
  
}