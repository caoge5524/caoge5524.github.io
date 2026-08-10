(() => {
  const config = window.BLOG_CONFIG || {}

  const getBackgroundLayer = () => {
    let layer = document.getElementById('blog-ambient-background')
    if (layer) return layer

    layer = document.createElement('div')
    layer.id = 'blog-ambient-background'
    layer.setAttribute('aria-hidden', 'true')
    layer.innerHTML = `
      <video id="blog-background-video" muted loop playsinline></video>
      <div id="blog-background-overlay"></div>
      <div id="blog-video-transition"></div>
      <canvas id="blog-particle-canvas"></canvas>
    `
    document.body.prepend(layer)
    return layer
  }

  const setupBackgroundOverlay = () => {
    const overlay = getBackgroundLayer().querySelector('#blog-background-overlay')
    const opacity = config.backgroundVideo?.overlayOpacity ?? 0.32
    overlay.style.backgroundColor = `rgba(12, 22, 20, ${Math.min(0.85, Math.max(0, opacity))})`
  }

  const setupBackgroundImage = () => {
    const imageConfig = config.backgroundImage
    if (!imageConfig?.enabled || !imageConfig.src) return

    const layer = getBackgroundLayer()
    layer.style.backgroundImage = `url("${imageConfig.src}")`
    setupBackgroundOverlay()
  }

  const setupBackgroundVideo = () => {
    const videoConfig = config.backgroundVideo
    if (!videoConfig || !videoConfig.enabled || !videoConfig.src) return

    const layer = getBackgroundLayer()
    const video = layer.querySelector('#blog-background-video')

    const revealVideo = () => {
      if (layer.classList.contains('is-video-ready') || layer.dataset.revealPending) return
      layer.dataset.revealPending = 'true'

      const startTransition = () => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        layer.classList.add('is-video-transitioning')
        window.setTimeout(() => layer.classList.add('is-video-ready'), reducedMotion ? 0 : 360)
        window.setTimeout(() => {
          layer.classList.remove('is-video-transitioning')
          delete layer.dataset.revealPending
        }, reducedMotion ? 20 : 1250)
      }

      const loadingBox = document.getElementById('loading-box')
      if (!loadingBox || loadingBox.classList.contains('loaded')) {
        window.setTimeout(startTransition, loadingBox ? 650 : 80)
        return
      }

      const observer = new MutationObserver(() => {
        if (!loadingBox.classList.contains('loaded')) return
        observer.disconnect()
        window.setTimeout(startTransition, 650)
      })
      observer.observe(loadingBox, { attributes: true, attributeFilter: ['class'] })
    }

    video.poster = videoConfig.poster || ''
    video.playbackRate = Math.min(2, Math.max(0.25, videoConfig.playbackRate || 1))
    setupBackgroundOverlay()
    video.addEventListener('canplay', revealVideo, { once: true })
    if (video.src !== new URL(videoConfig.src, location.href).href) {
      video.src = videoConfig.src
    }
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) revealVideo()
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.play().catch(() => {})
    }
  }

  const setupParticles = () => {
    const particleConfig = config.particles
    if (!particleConfig?.enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = getBackgroundLayer().querySelector('#blog-particle-canvas')
    if (canvas.dataset.ready) return
    canvas.dataset.ready = 'true'

    const context = canvas.getContext('2d')
    if (!context) return

    let width = 0
    let height = 0
    let particles = []
    let trails = []
    let animationFrame = 0
    const pointer = { x: 0, y: 0, active: false }
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches

    const createParticle = () => {
      const angle = Math.random() * Math.PI * 2
      const speed = (0.35 + Math.random() * 0.65) * (particleConfig.speed ?? 0.22)
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.8 + Math.random() * 1.6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
      }
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      const targetCount = isMobile()
        ? (particleConfig.mobileCount ?? 34)
        : (particleConfig.count ?? 62)
      particles = Array.from({ length: targetCount }, createParticle)
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)
      context.fillStyle = particleConfig.color || 'rgba(255, 255, 255, 0.72)'

      particles.forEach(particle => {
        if (pointer.active && particleConfig.mouseInteraction !== false) {
          const pointerX = pointer.x - particle.x
          const pointerY = pointer.y - particle.y
          const pointerDistance = Math.hypot(pointerX, pointerY)
          const interactionDistance = particleConfig.mouseDistance ?? 190
          if (pointerDistance > 0 && pointerDistance < interactionDistance) {
            const attraction = (1 - pointerDistance / interactionDistance) * (particleConfig.mouseForce ?? 0.85)
            particle.x += pointerX / pointerDistance * attraction
            particle.y += pointerY / pointerDistance * attraction
          }
        }

        particle.x += particle.vx
        particle.y += particle.vy
        if (particle.x < -5) particle.x = width + 5
        if (particle.x > width + 5) particle.x = -5
        if (particle.y < -5) particle.y = height + 5
        if (particle.y > height + 5) particle.y = -5

        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()
      })

      const maxDistance = particleConfig.maxDistance ?? 128
      context.strokeStyle = particleConfig.linkColor || 'rgba(184, 225, 214, 0.24)'
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.hypot(dx, dy)
          if (distance >= maxDistance) continue
          context.globalAlpha = 1 - distance / maxDistance
          context.beginPath()
          context.moveTo(particles[i].x, particles[i].y)
          context.lineTo(particles[j].x, particles[j].y)
          context.stroke()
        }
      }
      context.globalAlpha = 1

      trails = trails.filter(trail => trail.life > 0)
      trails.forEach(trail => {
        trail.x += trail.vx
        trail.y += trail.vy
        trail.life -= 1
        context.globalAlpha = trail.life / trail.maxLife
        context.fillStyle = particleConfig.color || 'rgba(255, 255, 255, 0.72)'
        context.beginPath()
        context.arc(trail.x, trail.y, trail.radius, 0, Math.PI * 2)
        context.fill()
      })
      context.globalAlpha = 1

      if (pointer.active && particleConfig.mouseInteraction !== false) {
        const interactionDistance = particleConfig.mouseDistance ?? 190
        context.strokeStyle = particleConfig.linkColor || 'rgba(184, 225, 214, 0.24)'
        particles.forEach(particle => {
          const distance = Math.hypot(pointer.x - particle.x, pointer.y - particle.y)
          if (distance >= interactionDistance) return
          context.globalAlpha = 0.9 * (1 - distance / interactionDistance)
          context.beginPath()
          context.moveTo(pointer.x, pointer.y)
          context.lineTo(particle.x, particle.y)
          context.stroke()
        })
        context.globalAlpha = 1
      }

      animationFrame = requestAnimationFrame(draw)
    }

    const handleVisibility = () => {
      cancelAnimationFrame(animationFrame)
      if (!document.hidden) draw()
    }

    const handlePointerMove = event => {
      if (event.pointerType && event.pointerType !== 'mouse') return
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true

      const trailLength = particleConfig.trailLength ?? 18
      const newTrail = Array.from({ length: 2 }, () => {
        const angle = Math.random() * Math.PI * 2
        const drift = 0.15 + Math.random() * 0.35
        const life = 18 + Math.round(Math.random() * 16)
        return {
          x: pointer.x + (Math.random() - 0.5) * 8,
          y: pointer.y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * drift,
          vy: Math.sin(angle) * drift,
          radius: 0.8 + Math.random() * 1.5,
          life,
          maxLife: life
        }
      })
      trails.push(...newTrail)
      if (trails.length > trailLength) trails.splice(0, trails.length - trailLength)
    }

    const handlePointerLeave = () => {
      pointer.active = false
    }

    resize()
    draw()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', handlePointerLeave)
    window.addEventListener('blur', handlePointerLeave)
    document.addEventListener('visibilitychange', handleVisibility)
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
    setupBackgroundImage()
    setupBackgroundVideo()
    setupParticles()
    setupMusicPlayer()
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init, { once: true })
    : init()
  document.addEventListener('pjax:complete', setupBackgroundVideo)
})()
