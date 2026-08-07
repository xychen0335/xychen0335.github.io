# XYCHEN 的小站

这是一个面向 GitHub Pages 个人主页形式的静态博客：目标仓库名为 `xychen0335.github.io`。

## 本地预览

```bash
npm run dev
```

打开终端输出的本地地址即可预览。生产构建使用：

```bash
npm run build
```

构建结果在 `dist/`，可以直接作为 GitHub Pages 的发布目录。

停止预览：前台运行直接按 `Ctrl+C`；后台或残留进程执行 `pkill -f scripts/dev.mjs`（仍无效时用 `lsof -nP -iTCP:4173 -sTCP:LISTEN` 找到 PID 后 `kill <PID>`）。

## 写文章

在 `posts/` 目录下新增 Markdown 文件（一篇文章一个 `.md`），并使用现有的 front matter：

```yaml
---
title: '文章标题'
tags: [科研]
published: true
hideInList: false
isTop: false
---
```

文章日期不需要写在 front matter 里：构建时自动读取文件修改时间（Asia/Shanghai），编辑文章后日期自动更新。如要覆盖（例如保留原始发布日期），可加一行 `date: 2026-08-02 12:00:00`。

`published: false` 的文章不会生成页面；`hideInList: true` 的文章仍然生成独立页面，但不会出现在首页文章列表中。

文章分四类：**工作、科研、学习、生活**。默认按标题和标签自动归类，也可以在前置元数据中用 `category: 工作` 手动指定。

支持常用的 Markdown 语法：标题、列表（有序/无序/嵌套）、代码块、表格、引用、加粗、行内代码、链接与图片，以及 KaTeX 数学公式（`$...$` 行内、`$$...$$` 独立成行）。

## 管理文章

```bash
npm run posts
npm run post:hide -- <slug>
npm run post:show -- <slug>
npm run post:delete -- <slug> --yes
```

删除命令会先把文件移动到 `.trash/`，方便误删后恢复。

## GitHub Pages

仓库名使用 `xychen0335.github.io` 时，GitHub Pages 地址就是：

```text
https://xychen0335.github.io/
```

`.github/workflows/pages.yml` 已经准备好自动构建配置。将代码推送到 `main` 并在 GitHub 的 Pages 设置中选择 GitHub Actions 后，推送会自动部署。

### 手动触发部署

正常情况下推送到 `main` 会自动构建并部署。如果推送后迟迟没有生效（例如 GitHub 服务故障期间 push 事件可能被丢弃、不触发工作流），可以手动触发一次：

```bash
gh workflow run pages.yml --ref main
gh run watch
```

`workflow_dispatch` 不依赖 push 事件，即使 push 触发失灵也能正常部署。跑完后可确认线上是否更新：

```bash
curl -sI https://xychen0335.github.io/ | grep -i last-modified
```

### 定时自愈

`pages.yml` 内置了定时任务（每天北京时间 12:00 与 00:00 各构建一次最新 `main`），即使某次 push 事件被 GitHub 丢弃，站点最迟也会在下一个定时点自动收敛到最新版本，无需人工介入。
