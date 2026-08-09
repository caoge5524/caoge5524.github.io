# caoge.io Blog

基于 [Hexo 8](https://hexo.io/) 与 [Butterfly 5](https://butterfly.js.org/) 的个人博客。项目已配置 GitHub Actions 自动构建和部署，并参考 Bloom Isle 的信息架构补充了全屏首屏、打字副标题、本地搜索、暗色模式、文章目录、侧栏统计、加载动画、PJAX、点击文字、背景视频接口和背景音乐播放器。

## 快速开始

环境要求：Node.js 22（最低 Node.js 20）和 npm。

```bash
npm install
npm run server
```

本地访问 `http://localhost:4000`。生产构建命令：

```bash
npm run clean
npm run build
```

静态文件输出到 `public/`。

## GitHub Pages 部署

部署工作流位于 [`.github/workflows/pages.yml`](.github/workflows/pages.yml)，流程为：

1. 检出 `main` 分支。
2. 使用 Node.js 22 执行 `npm ci`。
3. 运行 Hexo 生成 `public/`。
4. 上传 Pages artifact，并通过 `actions/deploy-pages` 发布。

首次使用时，在 GitHub 仓库中打开 `Settings -> Pages`，将 `Build and deployment -> Source` 设为 **GitHub Actions**。以后推送到 `main` 会自动部署，也可以在 Actions 页面手动运行。

原报错 `The butterfly theme could not be found` 的原因是 GitHub Pages 使用 Jekyll 读取了 Hexo 的 `_config.yml`，并把 `theme: butterfly` 当成 Jekyll 主题。现在由自定义 Actions 先安装 npm 主题再执行 Hexo，且 `scripts/nojekyll.js` 会在每次构建后创建 `public/.nojekyll`，从而绕过 Jekyll。

## 个性化位置

| 功能 | 文件 | 修改内容 |
| --- | --- | --- |
| 站点名称、作者、描述、网址 | [`_config.yml`](_config.yml) | `title`、`subtitle`、`description`、`author`、`url` |
| 导航、头像、首屏、侧栏、搜索、主题功能 | [`_config.butterfly.yml`](_config.butterfly.yml) | Butterfly 的所有覆盖配置 |
| GitHub 与社交链接 | [`_config.butterfly.yml`](_config.butterfly.yml) | `social`、`aside.card_author.button` |
| 主色、卡片、导航、播放器样式 | [`source/css/custom.css`](source/css/custom.css) | CSS 变量与对应组件样式 |
| 背景视频、粒子、音乐、点击文字 | [`source/js/site-config.js`](source/js/site-config.js) | `BLOG_CONFIG` 中的功能开关与参数 |
| 动态背景与播放器逻辑 | [`source/js/media-player.js`](source/js/media-player.js) | 视频挂载、粒子画布、播放列表和控制按钮 |
| 页面轻交互 | [`source/js/custom.js`](source/js/custom.js) | 点击文字与 PJAX 后初始化 |
| 禁用 Jekyll 标记 | [`scripts/nojekyll.js`](scripts/nojekyll.js) | 构建后生成 `public/.nojekyll` |
| 关于页面 | [`source/about/index.md`](source/about/index.md) | 个人介绍与联系方式 |
| 新文章默认字段 | [`scaffolds/post.md`](scaffolds/post.md) | Front-matter 模板 |
| 默认首屏图 | `source/img/hero.jpg` | 替换为自己的横向图片 |
| 默认头像 | `source/img/avatar-placeholder.png` | 替换为自己的头像 |

不要直接修改 `node_modules/hexo-theme-butterfly`。依赖重新安装后其中的改动会丢失，主题覆盖应统一写在 `_config.butterfly.yml`、`source/css/` 和 `source/js/`。

## 背景视频

当前已启用 `source/media/椎名真昼4k_120fps.mp4`。更换视频时，将文件放入 `source/media/`，然后修改 [`source/js/site-config.js`](source/js/site-config.js)：

```js
backgroundVideo: {
  enabled: true,
  src: '/media/background.mp4',
  poster: '/img/hero.jpg',
  playbackRate: 1,
  overlayOpacity: 0.32
}
```

视频会静音循环播放并通过 `object-fit: cover` 固定铺满整个视口。`overlayOpacity` 控制文字与卡片后方的暗色遮罩，数值范围建议为 `0.2` 到 `0.55`。固定全屏和图层样式位于 [`source/css/custom.css`](source/css/custom.css) 的 `#blog-ambient-background` 区域。

建议使用 H.264 编码、无音轨，并尽量压缩到 10 MB 左右。导出时必须启用 Web 优化（Fast Start），确保 `moov` 元数据位于文件开头，否则 GitHub Pages 会在下载完整视频前一直显示静态海报。已有 MP4 可无损处理：

```bash
ffmpeg -i input.mp4 -map 0 -c copy -movflags +faststart output.mp4
```

较大的视频建议使用对象存储/CDN 或 Git LFS，避免仓库体积持续增长。

## 背景粒子

粒子在独立 Canvas 中绘制，覆盖于视频与暗色遮罩之上，但不会接收鼠标事件或遮挡页面内容。所有参数位于 [`source/js/site-config.js`](source/js/site-config.js)：

```js
particles: {
  enabled: true,
  count: 62,          // 桌面端粒子数
  mobileCount: 34,    // 手机端粒子数
  color: 'rgba(255, 255, 255, 0.72)',
  linkColor: 'rgba(184, 225, 214, 0.24)',
  maxDistance: 128,   // 粒子连线的最大距离
  speed: 0.22,
  mouseInteraction: true,
  mouseDistance: 190, // 鼠标影响半径
  mouseForce: 0.85,   // 粒子向鼠标聚拢的强度
  trailLength: 18     // 鼠标尾迹粒子数量
}
```

需要纯视频背景时，将 `particles.enabled` 改为 `false`；只关闭鼠标跟随时，将 `mouseInteraction` 改为 `false`。系统启用“减少动态效果”时，粒子动画与视频自动播放会自动停用。

## 背景音乐

当前已启用 `source/media/music/20 - Travelers.mp3`。更换或增加音乐时，将音频放入 `source/media/music/`，然后在 [`source/js/site-config.js`](source/js/site-config.js) 中编辑播放列表：

```js
music: {
  enabled: true,
  autoplay: false,
  volume: 0.55,
  tracks: [
    {
      title: '曲名',
      artist: '作者',
      src: '/media/music/song.mp3',
      cover: '/img/music-cover.png'
    }
  ]
}
```

浏览器通常会阻止未交互时自动播放，因此建议保持 `autoplay: false`。播放器支持播放/暂停、上一首、下一首和曲目结束后自动切换。

## 写作与页面

新建文章：

```bash
npx hexo new post "文章标题"
```

文章位于 `source/_posts/`。常用 Front-matter：

```yaml
---
title: 文章标题
date: 2026-08-09 20:00:00
updated: 2026-08-09 20:00:00
description: 首页摘要
cover: /img/posts/example/cover.jpg
categories:
  - 技术
tags:
  - Hexo
  - Blog
---
```

`source/tags/index.md`、`source/categories/index.md` 和 `source/about/index.md` 分别对应标签、分类和关于页面。本地全文搜索由 `hexo-generator-searchdb` 生成 `search.json`，配置位于 `_config.yml` 的 `search` 和 `_config.butterfly.yml` 的 `search`。

## 目录结构

```text
.
├─ .github/workflows/pages.yml   # GitHub Pages 构建与部署
├─ _config.yml                   # Hexo 站点配置
├─ _config.butterfly.yml         # Butterfly 功能与外观配置
├─ scaffolds/post.md             # 新文章模板
├─ scripts/nojekyll.js           # 构建后写入 .nojekyll
└─ source/
   ├─ _posts/                    # Markdown 文章
   ├─ about/                     # 关于页面
   ├─ categories/                # 分类页面
   ├─ tags/                      # 标签页面
   ├─ css/custom.css             # 自定义样式
   ├─ js/site-config.js          # 个性化功能总入口
   ├─ js/media-player.js         # 背景视频与音乐播放器
   ├─ js/custom.js               # 页面交互
   ├─ img/                       # 图片资源
   └─ media/                     # 视频与音频资源
```

## 常见问题

**Actions 仍显示 Jekyll 日志**

确认 `Settings -> Pages -> Source` 已选择 `GitHub Actions`，并重新运行 `Deploy Hexo to GitHub Pages`。正确日志中会出现 `npm ci` 和 `hexo generate`，不会出现 `github-pages` gem。

**本地主题找不到**

运行 `npm ci`。Butterfly 作为 npm 依赖安装在 `node_modules/hexo-theme-butterfly`，不需要把主题源码提交到 `themes/`。

**样式或脚本修改后没有变化**

执行 `npm run clean && npm run build`，浏览器再强制刷新。PJAX 开启后，新逻辑需要监听 `pjax:complete`；现有自定义脚本已经按此方式初始化。

**部署后资源路径错误**

当前仓库是用户主页仓库 `caoge5524.github.io`，因此根路径 `/` 正确。如果以后迁移到项目 Pages（如 `username.github.io/repo`），需要同步修改 `_config.yml` 中的 `url` 和 `root`。

## 资源说明

默认首屏背景来自 Unsplash 图片 `photo-1464822759023-fed622ff2c3b`，仅作为可替换的初始素材。正式上线前建议换成自己的图片、插画或视频。请确保音乐、图片和视频拥有可公开使用的授权。
