const request = require("supertest");
const app = require("../src/main.ts");
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
