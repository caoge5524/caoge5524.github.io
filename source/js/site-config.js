/**
 * Personalization entry point.
 * Replace media paths here after placing files in source/media/.
 */
window.BLOG_CONFIG = {
  backgroundVideo: {
    enabled: false,
    src: '/media/background.mp4',
    poster: '/img/hero.jpg'
  },
  music: {
    enabled: false,
    autoplay: false,
    volume: 0.55,
    tracks: [
      {
        title: '示例曲目',
        artist: '请替换音乐文件',
        src: '/media/music/example.mp3',
        cover: '/img/music-cover-placeholder.png'
      }
    ]
  },
  clickText: {
    enabled: true,
    words: ['保持好奇', '持续创造', '认真记录']
  }
}
