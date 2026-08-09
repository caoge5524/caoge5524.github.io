const fs = require('node:fs')
const path = require('node:path')

hexo.extend.filter.register('after_generate', () => {
  fs.mkdirSync(hexo.public_dir, { recursive: true })
  fs.writeFileSync(path.join(hexo.public_dir, '.nojekyll'), '')
})
