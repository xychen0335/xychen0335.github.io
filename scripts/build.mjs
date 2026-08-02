import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const postsDir = path.join(root, 'posts');

const site = {
  name: 'XYCHEN 的小站',
  shortName: 'XYCHEN / NOTES',
  username: 'xychen0335',
  repository: 'xychen0335.github.io',
  description: '记录研究、生活和那些还没有想明白的事。',
};

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

// 数学公式需要保留 &（对齐符），否则 KaTeX 无法解析
const escapeMath = (value = '') => String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 文章日期默认读文件的修改时间（Asia/Shanghai），front matter 的 date 仅作可选覆盖
const toDateString = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};

const parseScalar = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) return trimmed.slice(1, -1);
  return trimmed;
};

const parseList = (value) => {
  const trimmed = value.trim().replace(/^\[/, '').replace(/\]$/, '');
  if (!trimmed) return [];
  return trimmed.split(',').map((item) => String(parseScalar(item)).trim()).filter(Boolean);
};

const categoryOrder = ['工作', '科研', '学习', '生活'];

const categoryFor = (title, tags) => {
  const text = `${title} ${tags.join(' ')}`.toLowerCase();
  if (/科研|投稿|论文|wcl|扩散|controlnet|wgf|dm|aigc/.test(text)) return '科研';
  if (/实习|工作|招聘|秋招|春招|面经/.test(text)) return '工作';
  if (/刷题|保研|通信工程|课程|学习/.test(text)) return '学习';
  return '生活';
};

const inlineMarkdown = (value) => {
  const tokens = [];
  const store = (replacement) => {
    tokens.push(replacement);
    return `\u0000${tokens.length - 1}\u0000`;
  };
  let html = escapeHtml(value);
  // 先保护行内代码与数学公式，避免其中的 *、_、[ ] 被后续规则误解析
  html = html.replace(/`([^`]+)`/g, (_, code) => store(`<code>${code}</code>`));
  html = html.replace(/\$([^$\n]+)\$/g, (_, math) => store(`<span class="math-inline">$${escapeMath(math)}$</span>`));
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g, (_, alt, src) => store(`<img src="${src}" alt="${escapeHtml(alt)}" loading="lazy">`));
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g, (_, text, href) => {
    const external = /^(https?:)/.test(href);
    return store(`<a href="${href}"${external ? ' target="_blank" rel="noreferrer"' : ''}>${text}</a>`);
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, (_, strong) => store(`<strong>${strong}</strong>`));
  html = html.replace(/~~([^~]+)~~/g, (_, del) => store(`<del>${del}</del>`));
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, (_, before, em) => `${before}${store(`<em>${em}</em>`)}`);
  return html.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
};

const markdownToHtml = (markdown) => {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const output = [];
  let paragraph = [];
  let listItems = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${paragraph.map((line) => inlineMarkdown(line)).join('<br>')}</p>`);
      paragraph = [];
    }
  };

  const indentOf = (space) => (space.match(/\t/g) || []).length * 4 + space.replace(/\t/g, '').length;

  const parseList = (items) => {
    const ordered = items[0].ordered;
    let html = `<${ordered ? 'ol' : 'ul'}>`;
    let index = 0;
    while (index < items.length) {
      const item = items[index];
      let nested = '';
      let next = index + 1;
      if (next < items.length && items[next].indent > item.indent) {
        const deeper = [];
        while (next < items.length && items[next].indent > item.indent) deeper.push(items[next++]);
        nested = parseList(deeper);
      }
      html += `<li>${inlineMarkdown(item.text)}${nested}</li>`;
      index = next;
    }
    return `${html}</${ordered ? 'ol' : 'ul'}>`;
  };

  const flushList = () => {
    if (listItems.length) {
      output.push(parseList(listItems));
      listItems = [];
    }
  };

  const isTableSeparator = (line) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);

  const splitRow = (row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());

  const parseTable = (start) => {
    const head = splitRow(lines[start]);
    const align = splitRow(lines[start + 1]).map((cell) => {
      const left = cell.startsWith(':');
      const right = cell.endsWith(':');
      if (left && right) return ' style="text-align:center"';
      if (right) return ' style="text-align:right"';
      if (left) return ' style="text-align:left"';
      return '';
    });
    const rows = [];
    let index = start + 2;
    while (index < lines.length && /^\s*\|/.test(lines[index])) {
      rows.push(splitRow(lines[index]));
      index += 1;
    }
    const headHtml = `<thead><tr>${head.map((cell, i) => `<th${align[i] || ''}>${inlineMarkdown(cell)}</th>`).join('')}</tr></thead>`;
    const bodyHtml = `<tbody>${rows.map((row) => `<tr>${row.map((cell, i) => `<td${align[i] || ''}>${inlineMarkdown(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`;
    return { html: `<div class="table-wrap"><table>${headHtml}${bodyHtml}</table></div>`, next: index };
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^\s*\|/.test(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      flushParagraph();
      flushList();
      const table = parseTable(i);
      if (table) {
        output.push(table.html);
        i = table.next - 1;
        continue;
      }
    }

    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})([\w+-]*)\s*$/);
    if (fence) {
      flushParagraph();
      flushList();
      const marker = fence[1][0];
      const close = new RegExp(`^\\s{0,3}${marker === '`' ? '`' : '~'}{3,}\\s*$`);
      const code = [];
      let j = i + 1;
      while (j < lines.length && !close.test(lines[j])) {
        code.push(lines[j]);
        j += 1;
      }
      const lang = fence[2] ? ` class="language-${escapeHtml(fence[2])}"` : '';
      // 去掉代码块的公共缩进
      const indents = code.filter((line) => line.trim()).map((line) => line.match(/^\s*/)[0].length);
      const common = indents.length ? Math.min(...indents) : 0;
      output.push(`<pre><code${lang}>${escapeHtml(code.map((line) => line.slice(common)).join('\n'))}</code></pre>`);
      i = j;
      continue;
    }

    if (/^\s*\$\$/.test(line)) {
      flushParagraph();
      flushList();
      const mathLines = [];
      let j = i + 1;
      while (j < lines.length && !/^\s*\$\$/.test(lines[j])) {
        mathLines.push(lines[j]);
        j += 1;
      }
      output.push(`<div class="math-display">$$${escapeMath(mathLines.join('\n'))}$$</div>`);
      i = j;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushParagraph();
      flushList();
      const quoted = [line.replace(/^>\s?/, '')];
      while (i + 1 < lines.length && /^>\s?/.test(lines[i + 1])) {
        quoted.push(lines[i + 1].replace(/^>\s?/, ''));
        i += 1;
      }
      output.push(`<blockquote>${quoted.map((quote) => inlineMarkdown(quote)).join('<br>')}</blockquote>`);
      continue;
    }

    if (/^\s*([-*_])\s*(?:\1\s*){2,}$/.test(line)) {
      flushParagraph();
      flushList();
      output.push('<hr>');
      continue;
    }

    const unordered = line.match(/^(\s*)[-*+]\s+(.+)$/);
    const ordered = line.match(/^(\s*)\d+\.(?!\d)\s*(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const item = unordered || ordered;
      listItems.push({ indent: indentOf(item[1]), ordered: Boolean(ordered), text: item[2] });
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return output.join('\n');
};

const parseMarkdownFile = (fileName, source, modified) => {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return null;
  const metadata = {};
  match[1].split('\n').forEach((line) => {
    const index = line.indexOf(':');
    if (index === -1) return;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    metadata[key] = key === 'tags' ? parseList(value) : parseScalar(value);
  });

  const base = path.basename(fileName, '.md');
  const slug = base.toLowerCase().replace(/&/g, '-and-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const title = metadata.title || base;
  const content = match[2].trim();

  return {
    fileName,
    slug,
    title,
    date: String(metadata.date || toDateString(modified)).slice(0, 10),
    tags: metadata.tags || [],
    category: metadata.category || categoryFor(title, metadata.tags || []),
    published: metadata.published !== false,
    hideInList: metadata.hideInList === true,
    isAbout: slug === 'about',
    content,
    html: markdownToHtml(content),
  };
};

const formatDate = (date) => date ? date.replaceAll('-', '.') : '未注明日期';
const tagsHtml = (post) => (post.tags.length ? post.tags : [post.category]).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');

const mathAssets = () => `
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css" crossorigin="anonymous">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.js" crossorigin="anonymous"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/contrib/auto-render.min.js" crossorigin="anonymous"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      if (window.renderMathInElement) {
        renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false,
          strict: false
        });
      }
    });
  </script>`;

const documentHtml = ({ title, description, body, prefix = '', math = false }) => `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#1e6b67">
  <title>${escapeHtml(title)} · ${escapeHtml(site.name)}</title>
  <link rel="stylesheet" href="${prefix}assets/styles.css">
  ${math ? mathAssets() : ''}
</head>
<body>
  <div class="page-shell">
    <header class="site-header">
      <a class="brand-lockup" href="${prefix}index.html" aria-label="返回首页"><span class="header-mark">陈</span><span class="wordmark">${site.shortName}</span></a>
      <nav class="nav-links" aria-label="主导航">
        <a href="${prefix}index.html#posts">文章</a>
        <a href="${prefix}posts/about.html" ${title.startsWith('关于') ? 'aria-current="page"' : ''}>关于</a>
      </nav>
    </header>
    ${body}
    <footer class="site-footer">
      <span>写给未来的自己，也写给偶然路过的人。</span>
      <span class="footer-mono">© ${new Date().getFullYear()} XYCHEN / ${site.repository}</span>
    </footer>
  </div>
</body>
</html>`;

const cardHtml = (post, featured = false) => {
  const searchText = escapeHtml(`${post.title} ${post.category} ${post.tags.join(' ')}`.toLowerCase());
  return `<article class="post-card${featured ? ' is-featured' : ''}" data-post-card data-category="${escapeHtml(post.category)}" data-search="${searchText}">
    <div class="post-meta"><span>${escapeHtml(formatDate(post.date))}</span><span>${escapeHtml(post.category)}</span></div>
    <h3><a href="posts/${post.slug}.html">${escapeHtml(post.title)}</a></h3>
    <div class="card-footer"><div class="tag-row">${tagsHtml(post)}</div><a class="card-arrow" href="posts/${post.slug}.html" aria-label="阅读 ${escapeHtml(post.title)}">↗</a></div>
  </article>`;
};

const buildIndex = (posts, about) => {
  const cards = posts.map((post, index) => cardHtml(post, index === 0)).join('\n');
  const categories = [...new Set(posts.map((post) => post.category))].sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));
  const filters = ['全部', ...categories].map((category) => {
    const value = category === '全部' ? 'all' : category;
    return `<button class="filter-button${category === '全部' ? ' is-active' : ''}" type="button" data-filter="${value}" aria-pressed="${category === '全部' ? 'true' : 'false'}">${category}</button>`;
  }).join('');
  const body = `<main>
    <section class="hero">
      <div>
        <div class="eyebrow">xychen 的日常记录</div>
        <h1>答案还在路上，<br><em>先把过程写下来。</em></h1>
        <p class="hero-copy">这里是 XYCHEN 的个人小站。记录工作、学习和生活，也记录那些在路上慢慢想清楚的事情。</p>
        <div class="hero-actions"><a class="button" href="#posts">浏览文章 <span>↘</span></a><a class="text-link" href="posts/${about ? about.slug : 'about'}.html">认识一下 →</a></div>
      </div>
      <aside class="hero-note"><span class="hero-note-label">A small archive</span><p>“有空会更新自己的一些浅薄见解。”</p><small>01 — 2026</small></aside>
    </section>
    <section id="posts" aria-labelledby="posts-title">
      <div class="section-heading"><span class="section-label">Archive / ${String(posts.length).padStart(2, '0')} entries</span><h2 id="posts-title">最近写下的东西</h2></div>
      <div class="controls"><label class="search-wrap"><span class="visually-hidden">搜索文章</span><input class="search-input" type="search" placeholder="搜索标题、内容或标签…" data-search aria-label="搜索文章"><span class="visually-hidden" data-result-count></span></label><div class="filter-list" role="group" aria-label="文章分类">${filters}</div></div>
      <div class="post-grid">${cards}<div class="empty-state" data-empty hidden>没有找到匹配的文章。换一个关键词试试？</div></div>
    </section>
  </main>`;
  return documentHtml({ title: '首页', description: site.description, body }).replace('</body>', '<script src="assets/app.js" defer></script>\n</body>');
};

const buildArticle = (post) => {
  const body = `<main class="article-wrap">
    <div class="article-kicker"><span class="eyebrow">${escapeHtml(post.category)}</span><span class="post-meta">${escapeHtml(formatDate(post.date))}</span></div>
    <h1 class="article-title">${escapeHtml(post.title)}</h1>
    <div class="article-divider"></div>
    <article class="article-body">${post.html}</article>
    <a class="back-link" href="../index.html#posts">← 返回文章列表</a>
  </main>`;
  return documentHtml({ title: post.title, description: site.description, body, prefix: '../', math: true });
};

const buildAbout = (post) => {
  const body = `<main class="about-grid">
    <div><div class="about-stamp">XYCHEN<br>PERSONAL<br>ARCHIVE<br>2024—NOW</div></div>
    <div class="about-content"><div class="article-kicker"><span class="eyebrow">About this place</span></div><h1 class="article-title">关于这里</h1><article class="article-body">${post ? post.html : '<p>这里还没有关于页面。</p>'}</article></div>
  </main>`;
  return documentHtml({ title: '关于', description: '关于 XYCHEN 和这个个人博客。', body, prefix: '../', math: true });
};

export async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(path.join(dist, 'assets'), { recursive: true });
  await mkdir(path.join(dist, 'posts'), { recursive: true });

  const files = (await readdir(postsDir)).filter((file) => file.endsWith('.md'));
  const parsed = (await Promise.all(files.map(async (file) => {
    const source = await readFile(path.join(postsDir, file), 'utf8');
    const { mtime } = await stat(path.join(postsDir, file));
    return parseMarkdownFile(file, source, mtime);
  }))).filter(Boolean);
  const published = parsed.filter((post) => post.published).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const about = published.find((post) => post.isAbout);
  const visible = published.filter((post) => !post.hideInList && !post.isAbout);

  await copyFile(path.join(root, 'src/styles.css'), path.join(dist, 'assets/styles.css'));
  await copyFile(path.join(root, 'src/app.js'), path.join(dist, 'assets/app.js'));
  await writeFile(path.join(dist, 'index.html'), buildIndex(visible, about), 'utf8');
  await writeFile(path.join(dist, '404.html'), buildIndex(visible, about), 'utf8');
  await writeFile(path.join(dist, '.nojekyll'), '', 'utf8');
  for (const post of published) await writeFile(path.join(dist, 'posts', `${post.slug}.html`), post.isAbout ? buildAbout(post) : buildArticle(post), 'utf8');
  console.log(`Built ${visible.length} listed posts and ${published.length - visible.length} hidden pages into dist/`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
