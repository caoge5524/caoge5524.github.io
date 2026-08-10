/**
 * Personalization entry point.
 * Replace media paths here after placing files in source/media/.
 */
window.BLOG_CONFIG = {
  backgroundVideo: {
    enabled: true,
    src: '/media/background.mp4?v=20260810-1',
    poster: '/img/hero.jpg',
    playbackRate: 1,
    overlayOpacity: 0.32
  },
  particles: {
    enabled: true,
    count: 62,
    mobileCount: 34,
    color: 'rgba(255, 255, 255, 0.72)',
    linkColor: 'rgba(184, 225, 214, 0.24)',
    maxDistance: 128,
    speed: 0.22,
    mouseInteraction: true,
    mouseDistance: 190,
    mouseForce: 0.85,
    trailLength: 18
  },
  music: {
    enabled: true,
    autoplay: false,
    volume: 0.55,
    tracks: [
      {
        title: '20-Travelers',
        artist: 'OUTER WILDS',
        src: '/media/music/20 - Travelers.mp3?v=20260810-1',
        cover: '/img/music-cover-placeholder.png'
      }
    ]
  },
  clickText: {
    enabled: true,
    words: ['We', 'are', 'Falcons']
  }
}
