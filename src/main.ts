import 'dotenv/config';
import * as http from 'http';
import { randomUUID } from 'crypto';
import cluster from 'cluster';
import { cpus } from 'os';

const port = Number(process.env.PORT) || 3000;
const hostname = '127.0.0.1';

interface IUser {
  id: string,
  username: string,
  age: number,
  hobbies: string[]
}

const users: IUser[] = [];

const STATUS_OK = 200;
const STATUS_CREATE = 201;
const STATUS_DELETE = 204;
const STATUS_INPUT_INVALID = 400;
const STATUS_NOT_FOUND = 404;
const STATUS_FAIL = 500;

const headers = {
  'Content-Type': 'application/json'
};

const writeError = (response: http.ServerResponse, statusCode: number, message: string) => {
  response.writeHead(STATUS_NOT_FOUND, headers);
  response.end(JSON.stringify({ statusCode, message }));
}

const writeResult = (response: http.ServerResponse, statusCode: number, data: any) => {
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
}

const isUUID = (uuid: string) => {
  return /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(uuid);
}

const parseUser = (body: string, response: http.ServerResponse) => {
  let user: IUser | undefined;
  try {
    user = JSON.parse(body) as IUser;
  }
  catch {
  }

  if (typeof user?.username === 'string'
    && typeof user?.age === 'number'
    && Array.isArray(user?.hobbies) && user.hobbies.every((x) => typeof x === 'string')) {
    return user;
  }
  else {
    writeError(response, STATUS_INPUT_INVALID, 'Input data invalid');
  }
}

const findUserIndex = (pathname: string, response: http.ServerResponse) => {
  const uuid = pathname.replace('/api/users/', '');
  let index = -1;
  if (isUUID(uuid)) {
    index = users.findIndex((x) => uuid === x.id);
    if (index === -1) {
      writeError(response, STATUS_NOT_FOUND, 'User not found');
    }
  }
  else {
    writeError(response, STATUS_INPUT_INVALID, 'UUID invalid');
  }
  return index;
}

const startServer = () => {
  const server = http.createServer((request, response) => {
    const { pathname } = new URL(request.url as string, `http://${request.headers.host}`);
    try {
      if (pathname === '/api/users' && request.method === 'GET') {
        writeResult(response, STATUS_OK, users);
      }
      else if (pathname.startsWith('/api/users/') && request.method === 'GET') {
        const userIndex = findUserIndex(pathname, response);
        if (userIndex !== -1) {
          writeResult(response, STATUS_OK, users[userIndex]);
        }
      }
      else if (pathname === '/api/users' && request.method === 'POST') {
        let body = "";
        request.on("data", function (chunk) {
          body += chunk;
        });

        request.on("end", function () {
          const user = parseUser(body, response);
          if (user) {
            user.id = randomUUID();
            users.push(user);
            writeResult(response, STATUS_CREATE, user);
          }
        });
      }
      else if (pathname.startsWith('/api/users/') && request.method === 'DELETE') {
        const userIndex = findUserIndex(pathname, response);
        if (userIndex !== -1) {
          const user = users[userIndex];
          users.splice(userIndex, 1);
          writeResult(response, STATUS_DELETE, user);
        }
      }
      else if (pathname.startsWith('/api/users/') && request.method === 'PUT') {
        let body = "";
        request.on("data", function (chunk) {
          body += chunk;
        });

        request.on("end", function () {
          const userIndex = findUserIndex(pathname, response);
          if (userIndex !== -1) {
            const user = parseUser(body, response);
            if (user) {
              users[userIndex].username = user.username;
              users[userIndex].age = user.age;
              users[userIndex].hobbies = user.hobbies;
              writeResult(response, STATUS_OK, users[userIndex]);
            }
          }
        });
      }
      else {
        writeError(response, STATUS_NOT_FOUND, 'Endpoint not found');
      }
    }
    catch {
      writeError(response, STATUS_FAIL, 'Server side error');
    }
  }).listen(port, hostname);
}


if (cluster.isPrimary) {
  if (process.argv.includes('--multi')) {
    console.log(`Cluster running at http://${hostname}:${port}/`);
    const numCPUs = cpus().length;
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

