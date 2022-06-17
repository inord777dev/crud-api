const request = require("supertest");
const app = require("../src/app.ts").default;

describe("Scenario 2", () => {
  it("Server should exist", (done) => {
    expect(app).toBeDefined();
    done();
  });

  it("Server should be an object", (done) => {
    expect(typeof app).toBe("object");
    done();
  });
});
