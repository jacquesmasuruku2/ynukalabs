const http = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const port = Number(process.env.PORT || 3000);

const app = next({
  dev,
  hostname: '0.0.0.0',
  port,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  http
    .createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen(port, () => {
      console.log(`> Ready on port ${port}`);
    });
}).catch((err) => {
  console.error('Failed to start Next.js server', err);
  process.exit(1);
});
