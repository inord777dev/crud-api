import 'dotenv/config';
import * as http from 'http';
import { randomUUID } from 'crypto';

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
  response.writeHead(STATUS_OK, headers);
  response.end(JSON.stringify(data));
}

const isUUID = (uuid: string) => {
  return /^[0-9A-F]{8}-[0-9A-F]{4}-[1][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(uuid);
}

const parseData = (body: string) => {
  let obj;
  try {
    obj = JSON.parse(body);
  }
  catch {
  }
  return obj;
}

const server = http.createServer((request, response) => {
  const { pathname } = new URL(request.url as string, `http://${request.headers.host}`);
  try {
    if (pathname === '/api/users' && request.method === 'GET') {
      writeResult(response, STATUS_OK, users);
    }
    else if (pathname === '/api/users' && request.method === 'POST') {
      let body = "";

      request.on("data", function (chunk) {
        body += chunk;
      });

      request.on("end", function () {
        const user = parseData(body) as IUser;
        if (typeof user?.username === 'string'
          && typeof user?.age === 'number'
          && Array.isArray(user?.hobbies) && user.hobbies.every((x) => typeof x === 'string')) {
          user.id = randomUUID();
          users.push(user);
          writeResult(response, STATUS_CREATE, user);
        }
        else {
          writeError(response, STATUS_INPUT_INVALID, 'Input data invalid');
        }
      });
    }
    else if (pathname.startsWith('/api/users/') && request.method === 'GET') {
      const uuid = pathname.replace('/api/users/', '');
      if (isUUID(uuid)) {
        const user = users.find((x) => uuid === x.id);
        if (user) {
          writeResult(response, STATUS_OK, user);
        }
        else {
          writeError(response, STATUS_NOT_FOUND, 'User not found');
        }
      }
      else {
        writeError(response, STATUS_INPUT_INVALID, 'UUID invalid');
      }
    }
    else {
      writeError(response, STATUS_NOT_FOUND, 'Endpoint not found');
    }
  }
  catch {
    writeError(response, STATUS_FAIL, 'Server side error');
  }
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})