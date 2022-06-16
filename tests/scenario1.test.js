const request = require("supertest");
const app = require("../src/app.ts").default;

describe("Test's scenario 1)", () => {
  it("responds with json", function (done) {
    request(app)
      .get("api/users")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });
});
