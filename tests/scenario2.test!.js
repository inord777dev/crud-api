const request = require("supertest");
const app = require("../src/app.ts").default;

describe("server working", () => {
  it("should exist", (done) => {
    expect(app).toBeDefined();
    done();
  });

  it("should be an object", (done) => {
    expect(typeof app).toBe("object");
    done();
  });
});
