(() => {
  const config = window.BLOG_CONFIG || {}

  const setupBackgroundVideo = () => {
    const videoConfig = config.backgroundVideo
    if (!videoConfig || !videoConfig.enabled || !videoConfig.src) return

    let video = document.getElementById('blog-background-video')
    if (!video) {
      video = document.createElement('video')
      video.id = 'blog-background-video'
      video.autoplay = true
      video.muted = true
      video.loop = true
      video.playsInline = true
      video.setAttribute('aria-hidden', 'true')
      document.body.prepend(video)
    }

    video.poster = videoConfig.poster || ''
    if (video.src !== new URL(videoConfig.src, location.href).href) {
      video.src = videoConfig.src
    }
  }

  const setupMusicPlayer = () => {
    const musicConfig = config.music
    if (!musicConfig || !musicConfig.enabled || !musicConfig.tracks?.length) return
    if (document.getElementById('blog-music-player')) return

    let current = 0
    const audio = new Audio()
    audio.volume = Math.min(1, Math.max(0, musicConfig.volume ?? 0.55))
    audio.preload = 'metadata'

    const player = document.createElement('div')
    player.id = 'blog-music-player'
    player.innerHTML = `
      <img class="music-cover" alt="" />
      <div class="music-meta">
        <span class="music-title"></span>
        <span class="music-artist"></span>
      </div>
      <button class="music-prev" type="button" title="上一首" aria-label="上一首"><i class="fas fa-backward-step"></i></button>
      <button class="music-toggle" type="button" title="播放或暂停" aria-label="播放或暂停"><i class="fas fa-play"></i></button>
      <button class="music-next" type="button" title="下一首" aria-label="下一首"><i class="fas fa-forward-step"></i></button>
    `
    document.body.appendChild(player)

    const cover = player.querySelector('.music-cover')
    const title = player.querySelector('.music-title')
    const artist = player.querySelector('.music-artist')
    const toggle = player.querySelector('.music-toggle i')

    const loadTrack = index => {
      current = (index + musicConfig.tracks.length) % musicConfig.tracks.length
      const track = musicConfig.tracks[current]
      audio.src = track.src
      cover.src = track.cover || musicConfig.defaultCover || '/img/music-cover-placeholder.png'
      cover.alt = `${track.title || '音乐'}封面`
      title.textContent = track.title || '未命名曲目'
      artist.textContent = track.artist || ''
    }

    const syncState = () => {
      toggle.className = audio.paused ? 'fas fa-play' : 'fas fa-pause'
      player.classList.toggle('is-playing', !audio.paused)
    }

    player.querySelector('.music-toggle').addEventListener('click', () => {
      audio.paused ? audio.play().catch(() => {}) : audio.pause()
    })
    player.querySelector('.music-prev').addEventListener('click', () => {
      loadTrack(current - 1)
      audio.play().catch(() => {})
    })
    player.querySelector('.music-next').addEventListener('click', () => {
      loadTrack(current + 1)
      audio.play().catch(() => {})
    })
    audio.addEventListener('play', syncState)
    audio.addEventListener('pause', syncState)
    audio.addEventListener('ended', () => {
      loadTrack(current + 1)
      audio.play().catch(() => {})
    })

    loadTrack(0)
    syncState()
    if (musicConfig.autoplay) audio.play().catch(() => {})
  }

  const init = () => {
    setupBackgroundVideo()
    setupMusicPlayer()
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init, { once: true })
    : init()
  document.addEventListener('pjax:complete', setupBackgroundVideo)
})()
