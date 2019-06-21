{
  let view = {
    el: '.page > main',
    init () {
      this.$el = $(this.el)
    },
    template: `
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
      if (data.id) {
        $(this.el).prepend('<h1>编译歌曲</h1>')
      } else {
        $(this.el).prepend('<h1>新建歌曲</h1>')
      }
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
    },
    update (data) {
      let song = AV.Object.createWithoutData('Song', this.data.id)
      song.set('name', data.name)
      song.set('singer', data.singer)
      song.set('url', data.url)
      return song.save().then((response) => {
        Object.assign(this.data, data)
        return response
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
      window.eventHub.on('select', (data) => {
        this.model.data = data
        this.view.render(this.model.data)
      })
      window.eventHub.on('new', (data) => {
        if (this.model.data.id) { // 点击歌曲列表后点击新建歌曲触发
          this.model.data = {
            name: '', singer: '', url: '', id: ''
          }
        } else { // 多次点击新建歌曲触发
          Object.assign(this.model.data, data)
        }
        this.view.render(this.model.data)
      })
    },
    create () {
      let needs = 'name singer url'.split(' ') // 转成数组
      let data = {}
      needs.map((string) => { // 将歌曲数据填入 data
        data[string] = this.view.$el.find(`[name=${string}]`).val()
      })
      this.model.create(data).then(() => { // 存入数据 leancloud 数据库成功后调用
        this.view.reset() // 置空
        window.eventHub.emit('create', JSON.parse(JSON.stringify(this.model.data))) // 深拷贝,避免模快数据相互影响
      })
    },
    update () {
      let needs = 'name singer url'.split(' ') // 转成数组
      let data = {}
      needs.map((string) => {
        data[string] = this.view.$el.find(`[name=${string}]`).val()
      })
      this.model.update(data).then(() => {
        window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data)))
      })
    },
    bindEvents () {
      this.view.$el.on('submit', 'form', (e) => {
        e.preventDefault() // 阻止默认事件
        if (this.model.data.id) {
          this.update()
        } else {
          this.create()
        }
      })
    }
  }
  controller.init(view, model)
}
