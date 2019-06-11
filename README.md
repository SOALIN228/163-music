# 163-music
仿网易云音乐
## 管理员页面
admin 页面

## 学到的知识
1. encodeURI 和 encodeURIComponent

    - 如果是完整的网址用 encodeURI
    - 网址中包含查询参时用 encodeURIComponent

2. 活用结构赋值

    Object.assign 会将右侧的键名赋给左面， ...会将attributes的所以属性展开

    ```javascript
    let { id, attributes } = newSong
    // ES5
    this.data.name = this.attributes.name
    this.data.singer = this.attributes.singer
    this.data.url = this.attributes.url
    // ES6
    Object.assign(this.data, { id, ...attributes })
    ```

3. 使用 **订阅**/**发布** (先订阅在发布，类似订报纸)模式进行数据解耦

   ```javascript
   window.eventHub = {
     events: {},
     emit (eventName, data) { // 发布
       for (let key in this.events) {
         if (key === eventName) {
           let fnList = this.events[key]
           fnList.map((fn) => { // 遍历
             fn.call(undefined, data)
           })
         }
       }
     },
     on (eventName, fn) { // 订阅
       if (this.events[eventName] === undefined) {
         this.events[eventName] = []
       }
       this.events[eventName].push(fn)
     }
   }
   ```

4. 使用**深拷贝**避免在数据传递过程中**传递的是地址而不是值**，造成错误

   ```javascript
   let string = JSON.stringify(this.model.data) // 深拷贝,
   let object = JSON.parse(string) // 因为每次传过去的是 this.model.data 的地址
   window.eventHub.emit('create', object) // 发布
   ```
