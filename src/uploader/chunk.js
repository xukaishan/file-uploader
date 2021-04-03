export default class Chunk {
  STATUS = {
    PENDING: 'pending',
    UPLOADING: 'uploading',
    READING: 'reading',
    SUCCESS: 'success',
    ERROR: 'error',
    COMPLETE: 'complete',
    PROGRESS: 'progress',
    RETRY: 'retry'
  }
  constructor(file, opts = {}, uploadControler) {
    this.chunkSize = 1024 * 1024;
    this.size = file.size;
    this.offset = 0;
    this.chunksEvent = [];
    this.uploadControler = uploadControler
    this.chunksNo = Math.ceil(this.size / this.chunkSize)
    Object.assign(this, opts)
    this.file = file;
    this.initChunks()
    console.log('Chunk file',file)
  }
  
  sliceChunk (file, start, end) {
    return file.slice(start, end)
  }

  initChunks () {
    for (let offset = 0; offset < this.chunksNo; offset++) {
      this.chunksEvent.push(() => {
        const end = Math.min((offset + 1) * this.chunkSize, this.size)
        const chunk = this.sliceChunk(this.file, offset * this.chunkSize, end);
        return this.send('', chunk, { index: offset, total: this.chunksNo })
      })
    }
    this.uploadControler.on('uploadChunks', this.chunksEvent)
  }

  send (url, chuck, params) {
    return new Promise((resolve, reject) => {
      const doneHandler = () => {
        if (this.xhr.readyState === 4) {
          if (this.xhr.status === 200) {
            var data = JSON.parse(this.xhr.responseText);
            console.log(data)
            resolve(data)
          } else {
            reject(this.xhr.statusText)
            console.log(this.xhr.statusText);
          }
        }
      };
      const progressHandler = () => {}
      this.xhr = new XMLHttpRequest()
      this.xhr.upload.addEventListener('progress', progressHandler, false)
      this.xhr.addEventListener('load', doneHandler, false)
      this.xhr.addEventListener('error', doneHandler, false)

      var formData = new FormData();
      Object.keys(params).forEach(key => {
        formData.append(key, params[key]);
      });
      formData.append('file', chuck);

      this.xhr.open('POST', url || 'http://localhost:3000/api/resource/upload');

      this.xhr.onerror = function (e) {
        console.log(this.xhr.statusText);
      }
      this.xhr.send(formData);

      

      
    }) 
    

    
  }
}