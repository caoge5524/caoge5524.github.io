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

  const init = () => {
    setupClickText()
    markPageReady()
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init, { once: true })
    : init()
  document.addEventListener('pjax:complete', markPageReady)
})()
