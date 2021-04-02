class EventControler {
  constructor() {
    this.events = {};
  }
  /** 事件监听 */
  on (name, callback) {
    if (!this.events[name]) {
      this.events[name] = [];
    }
    const cbs = typeof callback === 'function' && [callback] || callback
    this.events[name].push(...cbs);
  }
  /** 事件触发 返回 Promise */
  trigger (name, info, limit) {
    const len = this.events[name].length
    if (this.events[name] && len) {
      return this.limitTask(this.events[name], limit || len, info)
    }
  }
  /** 事件取消 */
  off (name, callback) {
    if (!callback) {
      this.events[name] && (this.events[name].length = 0)
      return
    }
    for (let i = 0; i < this.events[name].length; i++) {
      if (typeof callback === 'function' && this.events[name][i] === callback) {
        this.events[name].splice(i, 1)
      }
    }
  }
  /** 并发事件控制 */
  limitTask (arr, count = 6, params) {
    return new Promise((resolve, reject) => {
      let g = generator();
      let keep = true;
      let result = [];
      for (let i = 0; i < count; i++) {
        nextCall();
      }

      function nextCall () {
        let { value, done } = g.next();
        if (typeof value.then === 'function') {
          done || value.then((data) => {
            if (data === 'reject') {
              resolve(result);
              return;
            }
            result.push(data);
            if (result.length === arr.length) {
              keep = false;
              resolve(result);
            }
            keep && nextCall();
          }).catch(() => {
            keep = false;
            reject(new Error());
          });
        } else {
          result.push(value);
          if (result.length === arr.length) {
            keep = false;
            resolve(value);
          }
          keep && nextCall();
        }
      }

      function* generator () {
        if (arr.length === 0) {
          yield Promise.resolve('reject');
        }
        for (let fn of arr) {
          try {
            yield fn(params);
          } catch (e) {
            return e;
          }
        }
      }
    });
  }
}

export default EventControler
