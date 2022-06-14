import 'dotenv/config';
import * as http from 'http';

const port = Number(process.env.PORT) || 3000;
const hostname = '127.0.0.1';

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>Hello, World!</h1>');
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})