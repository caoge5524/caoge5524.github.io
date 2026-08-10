(() => {
  const setupClickText = () => {
    if (document.documentElement.dataset.clickTextReady) return
    const options = window.BLOG_CONFIG?.clickText
    if (!options?.enabled || !options.words?.length) return

    document.documentElement.dataset.clickTextReady = 'true'
    let cursor = 0
    document.addEventListener('click', event => {
      if (event.target.closest('a, button, input, textarea, select, audio')) return
      const label = document.createElement('span')
      label.className = 'click-text'
      label.textContent = options.words[cursor++ % options.words.length]
      label.style.left = `${event.clientX}px`
      label.style.top = `${event.clientY}px`
      document.body.appendChild(label)
      label.addEventListener('animationend', () => label.remove(), { once: true })
    })
  }

  const markPageReady = () => document.documentElement.classList.add('blog-ready')

  const getPageTitle = () => {
    const heading = document.querySelector('#page-site-info #site-title, #post-info .post-title, #site-info #site-title')
    return heading?.textContent.trim() || document.title.split(/[|\-]/)[0].trim() || 'caoge.io'
  }

  const setupScrollNav = () => {
    const nav = document.getElementById('nav')
    if (!nav) return

    let titleMask = nav.querySelector('#nav-page-title-mask')
    if (!titleMask) {
      titleMask = document.createElement('div')
      titleMask.id = 'nav-page-title-mask'
      titleMask.innerHTML = '<button id="nav-page-title" type="button" title="返回页面顶部"></button>'
      nav.appendChild(titleMask)
      titleMask.querySelector('button').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
    titleMask.querySelector('button').textContent = getPageTitle()

    if (document.documentElement.dataset.scrollNavReady) return
    document.documentElement.dataset.scrollNavReady = 'true'

    let lastScrollTop = Math.max(0, window.scrollY)
    let ticking = false
    const updateNav = () => {
      const currentNav = document.getElementById('nav')
      if (!currentNav) {
        ticking = false
        return
      }

      const scrollTop = Math.max(0, window.scrollY)
      const delta = scrollTop - lastScrollTop
      currentNav.classList.toggle('nav-scrolled', scrollTop > 12)
      if (scrollTop <= 50 || delta < -2) currentNav.classList.remove('nav-show-title')
      if (scrollTop > 50 && delta > 2) currentNav.classList.add('nav-show-title')
      lastScrollTop = scrollTop
      ticking = false
    }

    window.addEventListener('scroll', () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(updateNav)
    }, { passive: true })
    updateNav()
  }

  const init = () => {
    setupClickText()
    setupScrollNav()
    markPageReady()
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init, { once: true })
    : init()
  document.addEventListener('pjax:complete', () => {
    setupScrollNav()
    markPageReady()
  })
})()
