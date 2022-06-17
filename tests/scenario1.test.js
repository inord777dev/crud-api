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
        assert(response.body, "[]");
      });
  });

  let userId;
  const user = {
    username: "admin",
    age: 25,
    hobbies: ["js", "ts", "node js"],
  };

  it("A new object is created by a POST api/users request (a response containing newly created record is expected)", () => {
    return request(app)
      .post("/api/users")
      .send(user)
      .set("Accept", "application/json")
      .expect("Content-Type", "application/json")
      .expect(201)
      .then((response) => {
        assert(response.body, user);
        userId = response.body.id;
      });
  });

  it("With a GET api/user/{userId} request, we try to get the created record by its id (the created record is expected)", () => {
    return request(app)
      .get(`/api/users/${userId}`)
      .expect("Content-Type", "application/json")
      .expect(200)
      .then((response) => {
        assert(response.body, user);
      });
  });

  user.username = "superadmin";

  it("We try to update the created record with a PUT api/users/{userId}request (a response is expected containing an updated object with the same id)", () => {
    return request(app)
      .put(`/api/users/${userId}`)
      .send(user)
      .set("Accept", "application/json")
      .expect("Content-Type", "application/json")
      .expect(200)
      .then((response) => {
        assert(response.body, user);
      });
  });

  it("With a DELETE api/users/{userId} request, we delete the created object by id (confirmation of successful deletion is expected)", () => {
    return request(app).delete(`/api/users/${userId}`).expect(204);
  });

  it("With a GET api/users/{userId} request, we are trying to get a deleted object by id (expected answer is that there is no such object)", () => {
    return request(app)
      .get(`/api/users/${userId}`)
      .expect("Content-Type", "application/json")
      .expect(404)
      .then((response) => {
        assert(response.body.message, "User not found");
      });
  });
});
