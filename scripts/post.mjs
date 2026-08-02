import { mkdir, readdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(root, 'posts');
const trash = path.join(root, '.trash');
const action = process.argv[2];
const target = process.argv[3];

const slugify = (name) => name.toLowerCase().replace(/&/g, '-and-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const toDateString = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};

const parse = (fileName, source, modified) => {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return null;
  const fields = {};
  match[1].split('\n').forEach((line) => {
    const index = line.indexOf(':');
    if (index === -1) return;
    fields[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
  });
  return { fileName, slug: slugify(path.basename(fileName, '.md')), title: fields.title || fileName, date: fields.date ? fields.date.slice(0, 10) : toDateString(modified), published: fields.published !== 'false', hideInList: fields.hideInList === 'true' };
};

const posts = async () => {
  const files = (await readdir(postsDir)).filter((file) => file.endsWith('.md'));
  const items = await Promise.all(files.map(async (file) => {
    const source = await readFile(path.join(postsDir, file), 'utf8');
    const { mtime } = await stat(path.join(postsDir, file));
    return parse(file, source, mtime);
  }));
  return items.filter(Boolean);
};

const findPost = async (value) => {
  const all = await posts();
  return all.find((post) => post.fileName === value || post.slug === value || post.title === value);
};

const setField = async (post, key, value) => {
  const filePath = path.join(postsDir, post.fileName);
  const source = await readFile(filePath, 'utf8');
  const line = `${key}: ${value}`;
  const expression = new RegExp(`^${key}:.*$`, 'm');
  const updated = expression.test(source) ? source.replace(expression, line) : source.replace(/^---\s*\n/, `---\n${line}\n`);
  await writeFile(filePath, updated, 'utf8');
};

if (action === 'list') {
  const all = await posts();
  if (!all.length) console.log('暂无文章');
  all.sort((a, b) => b.date.localeCompare(a.date)).forEach((post) => console.log(`${post.slug.padEnd(42)} ${post.hideInList ? '隐藏' : '展示'}  ${post.published ? '已发布' : '草稿'}  ${post.title}`));
} else if (['hide', 'show'].includes(action)) {
  if (!target) throw new Error(`用法：npm run post:${action} -- <slug>`);
  const post = await findPost(target);
  if (!post) throw new Error(`找不到文章：${target}`);
  await setField(post, 'hideInList', action === 'hide' ? 'true' : 'false');
  console.log(`${action === 'hide' ? '已隐藏' : '已显示'}：${post.title}`);
} else if (action === 'delete') {
  if (!target || !process.argv.includes('--yes')) throw new Error('删除需要确认：npm run post:delete -- <slug> --yes');
  const post = await findPost(target);
  if (!post) throw new Error(`找不到文章：${target}`);
  await mkdir(trash, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(':', '-');
  await rename(path.join(postsDir, post.fileName), path.join(trash, `${stamp}-${post.fileName}`));
  console.log(`已移入 .trash，可从这里恢复：${post.fileName}`);
} else {
  console.log('用法：npm run posts | npm run post:hide -- <slug> | npm run post:show -- <slug> | npm run post:delete -- <slug> --yes');
}
