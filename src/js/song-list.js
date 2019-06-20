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
      let liList = songs.map((song) =>
        $('<li></li>').text(song.name).attr('data-song-id', song.id)
      ) // 遍历，箭头函数
      $el.find('ul').empty() // 将 ul 置空
      liList.map((domLi) => { // 渲染到视图上
        $el.find('ul').append(domLi)
      })
    },
    activeItem (li) {
      let $li = $(li)
      $li.addClass('active')
      .siblings('.active').removeClass('active')
    },
    clearActive () {
      $(this.el).find('.active').removeClass('active')
    }
  }
  let model = {
    data: {
      songs: []
    },
    find () {
      let query = new AV.Query('Song')
      return query.find().then((songs) => {
        this.data.songs = songs.map((songs) => {
          return { id: songs.id, ...songs.attributes }
        })
        return songs
      })
    }
  }
  let controller = {
    init (view, model) {
      this.view = view
      this.model = model
      this.view.render(this.model.data) // 渲染模板
      this.bindEvents()
      this.bindEventHub()
      this.getAllSongs()
    },
    getAllSongs () {
      return this.model.find().then(() => {
        this.view.render(this.model.data)
      })
    },
    bindEvents () {
      $(this.view.el).on('click', 'li', (e) => {
        this.view.activeItem(e.currentTarget)
        let songId = e.currentTarget.getAttribute('data-song-id') // 获取选中歌曲id
        let data
        let songs = this.model.data.songs
        for (let i = 0; i < songs.length; i++) { // 将选中歌曲信息赋值给data
          if (songs[i].id === songId) {
            data = songs[i]
            break
          }
        }
        window.eventHub.emit('select', JSON.parse(JSON.stringify(data))) // 深拷贝，避免模块间数据相互影响
      })
    },
    bindEventHub () {
      window.eventHub.on('upload', () => { // 订阅
        this.view.clearActive() // 移除 active
      })
      window.eventHub.on('create', (songData) => { // 订阅
        this.model.data.songs.push(songData) // 将新建歌曲的数据保存
        this.view.render(this.model.data) // 将新建歌曲数据渲染到视图上
      })
      window.eventHub.on('new', () => {
        this.view.clearActive()
      })
    }
  }
  controller.init(view, model)
}
