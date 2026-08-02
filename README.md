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

`.github/workflows/pages.yml` 已经准备好自动构建配置。当前不会触发发布；将代码推送到 `main` 并在 GitHub 的 Pages 设置中选择 GitHub Actions 后，后续推送才会部署。
