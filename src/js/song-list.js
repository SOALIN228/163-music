{
  let view = {
    el: '#songList-container',
    template: `
      <ul class="songList">
      </ul>
    `,
    render (data) {
      let $el = $(this.el)
      $el.html(this.template) // 初始化 ul 模板，方便后面使用 find
      let { songs } = data
      let liList = songs.map((song) => $('<li></li>').text(song.name)) // 遍历，箭头函数
      $el.find('ul').empty() // 将 ul 置空
      liList.map((domLi) => { // 渲染到视图上
        $el.find('ul').append(domLi)
      })
    },
    clearActive () {
      $(this.el).find('.active').removeClass('active')
    }
  }
  let model = {
    data: {
      songs: []
    }
  }
  let controller = {
    init (view, model) {
      this.view = view
      this.model = model
      this.view.render(this.model.data) // 渲染模板
      window.eventHub.on('upload', () => { // 订阅
        this.view.clearActive() // 移除 active
      })
      window.eventHub.on('create', (songData) => { // 订阅
        this.model.data.songs.push(songData) // 将新建歌曲的数据保存
        this.view.render(this.model.data) // 将新建歌曲数据渲染到视图上
      })
    }
  }
  controller.init(view, model)
}
