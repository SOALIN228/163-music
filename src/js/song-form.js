{
  let view = {
    el: '.page > main',
    init () {
      this.$el = $(this.el)
    },
    template: `
      <h1>新建歌曲</h1>
      <form action="" class="form">
        <div class="row">
          <label>歌名</label>
          <input name="name" type="text" value="__name__">
        </div>
        <div class="row">
          <label>歌手</label>
          <input name="singer" type="text" value="__singer__">
        </div>
        <div class="row">
          <label>外链</label>
          <input name="url" type="text" value="__url__">
        </div>
        <div class="row actions">
          <button type="submit">保存</button>
        </div>
      </form>
    `,
    render (data = {}) {
      let placeholders = ['name', 'singer', 'url']
      let html = this.template
      placeholders.map((string) => { // 将歌曲信息和占位符替换
        html = html.replace(`__${string}__`, data[string] || '') // 避免置空时出现 undefined
      })
      $(this.el).html(html) // 渲染
    },
    reset () {
      this.render({}) // 置空
    }
  }
  let model = {
    data: {
      name: '',
      singer: '',
      url: '',
      id: ''
    },
    create (data) { // 存储到数据库
      let Song = AV.Object.extend('Song')
      let song = new Song()
      song.set('name', data.name)
      song.set('singer', data.singer)
      song.set('url', data.url)
      return song.save().then((newSong) => { // 成功后调用
        let { id, attributes } = newSong
        Object.assign(this.data, { id, ...attributes })
      }, (error) => {
        console.error(error)
      })
    }
  }
  let controller = {
    init (view, model) {
      this.view = view
      this.view.init() // 设置 jquery 对象，方遍后续使用
      this.model = model
      this.view.render(this.model.data) // 渲染模板
      this.bindEvents()
      window.eventHub.on('upload', (data) => { // 订阅
        this.model.data = data
        console.log(data)
        this.view.render(data)
      })
    },
    bindEvents () {
      this.view.$el.on('submit', 'form', (e) => {
        e.preventDefault() // 阻止默认事件
        let needs = 'name singer url'.split(' ') // 转成数组
        let data = {}
        needs.map((string) => { // 将歌曲数据填入 data
          data[string] = this.view.$el.find(`[name=${string}]`).val()
        })
        this.model.create(data).then(() => { // 存入数据 leancloud 数据库成功后调用
          this.view.reset() // 置空
          let string = JSON.stringify(this.model.data) // 深拷贝,
          let object = JSON.parse(string) // 因为每次传过去的是 this.model.data 的地址
          window.eventHub.emit('create', object) // 发布
        })
      })
    }
  }
  controller.init(view, model)
}
