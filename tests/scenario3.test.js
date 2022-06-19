const request = require("supertest");
const assert = require("assert");
const app = require("../src/app.ts").default;

describe("Scenario 1", () => {
  it("Get all records with a GET api/users request (an empty array is expected)", () => {
    return request(app)
      .get("/api/users")
      .expect("Content-Type", "application/json")
      .expect(200)
      .then((response) => {
        assert(response.body, []);
      });
  });

  let userAdminId;
  const userAdmin = {
    username: "admin",
    age: 25,
    hobbies: ["js", "ts", "node js"],
  };

  it("Admin is created by a POST api/users request (a response containing newly created record is expected)", () => {
    return request(app)
      .post("/api/users")
      .send(userAdmin)
      .set("Accept", "application/json")
      .expect("Content-Type", "application/json")
      .expect(201)
      .then((response) => {
        assert(response.body, userAdmin);
        userAdminId = response.body.id;
      });
  });

  let userGuestId;
  const userGuest = {
    username: "guest",
    age: 99,
    hobbies: [],
  };

  it("Guest is created by a POST api/users request (a response containing newly created record is expected)", () => {
    return request(app)
      .post("/api/users")
      .send(userGuest)
      .set("Accept", "application/json")
      .expect("Content-Type", "application/json")
      .expect(201)
      .then((response) => {
        assert(response.body, userGuest);
        userGuestId = response.body.id;
      });
  });

  it("Get count added records with a GET api/users request (array.length equal two is expected)", () => {
    return request(app)
      .get("/api/users")
      .expect("Content-Type", "application/json")
      .expect(200)
      .then((response) => {
        assert(Array.isArray(response.body), true);
        assert(response.body.length, 2);
      });
  });
});
