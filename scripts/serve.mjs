import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.PORT || 8080);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.mp4':'video/mp4','.ttf':'font/ttf'};
http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    const bytes = await readFile(file);
    response.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream','Content-Length':bytes.length});
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch {
    response.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});
    response.end('Файл не найден');
  }
}).listen(port, '127.0.0.1', () => console.log(`Сайт: http://localhost:${port}`));
