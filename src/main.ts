import cluster from 'cluster';
import { cpus } from 'os';
// @ts-ignore
import server from "./app.ts";

const hostname = '127.0.0.1';
const port = Number(process.env.PORT) || 3000;

const startServer = () => {
  if (process.env.NODE_ENV !== 'test') {
    server.listen(port, hostname);
  }
}

if (cluster.isPrimary) {
  if (process.argv.includes('--multi')) {
    const numCPUs = cpus().length;
    console.log(`Cluster running at http://${hostname}:${port}/`, `Start ${numCPUs} workers...`);
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
    });
  }
  else {
    console.log(`Server running at http://${hostname}:${port}/`);
    startServer();
  }
} else {
  startServer();
  console.log(`Worker ${process.pid} started`);
}