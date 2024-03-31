import supertest from "supertest";
import { expect } from "chai";
import app from "../backend/server.js";
import User from "../backend/models/userModel.js";

let agent;

beforeEach(() => {
  agent = supertest.agent(app);
});

describe("User API", () => {
  describe("Register new user: POST /api/users", () => {
    it("should create a new user and verify it was added to the database", async function () {
      const newUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password",
        username: "testuser",
      };

      const res = await agent.post("/api/users").send(newUser);

      expect(res.statusCode).to.equal(201);
      // Verify the response
      expect(res.body.name).to.equal(newUser.name);
      expect(res.body.email).to.equal(newUser.email);
      expect(res.body.username).to.equal(newUser.username);

      // Fetch the user from the database
      const userInDb = await User.findOne({ username: newUser.username });

      // Verify the user was added to the database
      expect(userInDb).to.exist;
      expect(userInDb.name).to.equal(newUser.name);
      expect(userInDb.email).to.equal(newUser.email);
      expect(userInDb.username).to.equal(newUser.username);

      //delete the user from the database
      await User.deleteOne({ username: newUser.username });
    });
    it("should return 400 if user already exists", async function () {
      const newUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password",
        username: "testuser",
      };

      // Create the user in the database
      await User.create(newUser);

      // Attempt to create the user again
      const res = await agent.post("/api/users").send(newUser);
      expect(res.statusCode).to.equal(400);
    });
    it("should return 400 if name is missing", async function () {
      const newUser = {
        email: "test@example.com",
        password: "password",
        username: "testuser",
      };

      const res = await agent.post("/api/users").send(newUser);
      expect(res.statusCode).to.equal(400);
    });

    it("should return 400 if email is missing", async function () {
      const newUser = {
        name: "Test User",
        password: "password",
        username: "testuser",
      };

      const res = await agent.post("/api/users").send(newUser);
      expect(res.statusCode).to.equal(400);
    });

    it("should return 400 if password is missing", async function () {
      const newUser = {
        name: "Test User",
        email: "test@example.com",
        username: "testuser",
      };

      const res = await agent.post("/api/users").send(newUser);
      expect(res.statusCode).to.equal(400);
    });

    it("should return 400 if username is missing", async function () {
      const newUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password",
      };

      const res = await agent.post("/api/users").send(newUser);
      expect(res.statusCode).to.equal(400);
    });
  });
});
