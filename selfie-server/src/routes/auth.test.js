// test/auth.test.js
import { expect } from "chai";
import sinon from "sinon";
import supertest from "supertest";
import express from "express";
import { createAuthRouter } from "../routes/auth.js";
import { describe, it, beforeEach, afterEach } from "mocha";

describe("Auth Router", () => {
  let app, request, dbMock;

  beforeEach(() => {
    dbMock = {
      login: sinon.stub(),
      register: sinon.stub(),
    };

    app = express();
    app.use(express.json());
    app.use("/", createAuthRouter(dbMock));
    request = supertest(app);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("POST /login", () => {
    it("should return 401 for invalid credentials", async () => {
      dbMock.login.resolves(null);

      const response = await request
        .post("/login")
        .send({ username: "user", password: "wrongpassword" });

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property("error", "Invalid credentials");
    });

    it("should return a token for valid credentials", async () => {
      const user = {
        _id: "123",
        email: "die@gmail.com",
        username: "die@gmail.com",
        password: "123456",
        role: "user",
      };
      dbMock.login.resolves(null);

      const response = await request
        .post("/login")
        .send({ username: "diebbo", password: "123456" });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("token");
    });
  });

  describe("POST /register", () => {
    it("should return 400 if user already exists", async () => {
      dbMock.register.resolves(null);

      const response = await request
        .post("/register")
        .send({
          username: "diebbo",
          password: "123456",
          email: "die@gmail.com",
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property("error", "User already exists");
    });

    it("should return a token on successful registration", async () => {
      dbMock.register.resolves(null);

      const response = await request
        .post("/register")
        .send({
          username: "user",
          password: "password",
          email: "user@example.com",
        });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("token");
    });
  });
});
