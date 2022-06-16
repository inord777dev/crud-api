const request = require("supertest");
const app = require("../src/main.ts");

const req = request(app);

describe("Test's scenario 1)", () => {
  it("responds with json", function (done) {
    req
      .post("/users")
      .send({ name: "john" })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        return done();
      });
  });
});
