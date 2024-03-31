import supertest from "supertest";
import { expect } from "chai";
import app from "../backend/server.js";
import User from "../backend/models/userModel.js";

let agent;

beforeEach(() => {
  agent = supertest.agent(app);
});

describe("User API", () => {
  // Create a new user in the database
  const mockUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password",
    username: "testuser",
  };
  before(async function () {
    await User.create(mockUser);
  });
  after(async () => {
    await User.deleteOne({ username: mockUser.username });
  });
  describe("Register new user: POST /api/users", () => {
    it("should create a new user and verify it was added to the database", async function () {
      const newUser = {
        name: "Test User 2",
        email: "test2@example.com",
        password: "password",
        username: "testuser2",
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
    it("should return 400 (User already exists with this email) if email already exists", async function () {
      const res = await agent.post("/api/users").send({
        name: "Test User 2",
        email: "test@example.com",
        password: "password",
        username: "testuser2",
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("User already exists with this email");
    });
    it("should return 400 (Username already taken) if username already exists", async function () {
      // Attempt to create the user again
      const res = await agent.post("/api/users").send({
        name: "Test User 2",
        email: "test2@example.com",
        password: "password",
        username: "testuser",
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Username already taken");
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
  describe("Login: POST /api/users/login", () => {
    it("should login user and return user object and cookie", async function () {
      const res = await agent.post("/api/users/auth").send({
        email: mockUser.email,
        password: mockUser.password,
      });

      expect(res.statusCode).to.equal(200);
      // Verify the response
      expect(res.body.name).to.equal(mockUser.name);
      expect(res.body.email).to.equal(mockUser.email);
      expect(res.body.username).to.equal(mockUser.username);

      // Verify the cookie
      expect(res.headers["set-cookie"]).to.exist;
    });
    it("should return 400 if email is missing", async function () {
      const res = await agent.post("/api/users/auth").send({
        password: "password",
      });

      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });

    it("should return 400 if password is missing", async function () {
      const res = await agent.post("/api/users/auth").send({
        email: "test@example.com",
      });

      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });

    it("should return 401 if email is incorrect", async function () {
      const res = await agent.post("/api/users/auth").send({
        email: "incorrect@example.com",
        password: "password",
      });

      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Invalid email or password");
    });

    it("should return 401 if password is incorrect", async function () {
      const res = await agent.post("/api/users/auth").send({
        email: "test@example.com",
        password: "incorrect",
      });

      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Invalid email or password");
    });
  });
  describe("Logout: POST /api/users/logout", () => {
    it("should logout the user and clear the session", async function () {
      // Login
      const loginRes = await agent.post("/api/users/auth").send({
        email: mockUser.email,
        password: mockUser.password,
      });
      expect(loginRes.statusCode).to.equal(200);

      // Check cookie
      expect(loginRes.headers["set-cookie"]).to.exist;

      // Logout
      const logoutRes = await agent.post("/api/users/logout");
      expect(logoutRes.statusCode).to.equal(200);

      // Try to access a route that requires authentication
      const protectedRes = await agent.get("/api/users/profile");

      // You should get a 401 error because the user is no longer authenticated
      expect(protectedRes.statusCode).to.equal(401);

      // Check cookie
      expect(protectedRes.headers["set-cookie"]).to.not.exist;
    });
  });
  describe("Get user profile: GET /api/users/profile", () => {
    it("should return the user's profile", async function () {
      // Log in the user
      const loginRes = await agent.post("/api/users/auth").send({
        email: mockUser.email,
        password: mockUser.password,
      });
      expect(loginRes.statusCode).to.equal(200);

      // Get the user's profile
      const profileRes = await agent.get("/api/users/profile");
      expect(profileRes.statusCode).to.equal(200);
      expect(profileRes.body).to.have.property("name");
      expect(profileRes.body).to.have.property("email");
      expect(profileRes.body).to.have.property("username");
      expect(profileRes.body).to.have.property("invites");
    });
    it("should return 401 if the user is not authenticated", async function () {
      const profileRes = await supertest(app).get("/api/users/profile");
      expect(profileRes.statusCode).to.equal(401);
    });
  });
  describe("Update user profile: PUT /api/users/profile", () => {
    it("should update the user's profile", async function () {
      // Create the user in the database
      const newUser = {
        name: "Test User 2",
        email: "test2@example.com",
        password: "password",
        username: "testuser2",
      };
      await User.create(newUser);
      // Log in the user
      const loginRes = await agent.post("/api/users/auth").send({
        email: mockUser.email,
        password: mockUser.password,
      });
      expect(loginRes.statusCode).to.equal(200);

      // Update the user's profile
      const updateRes = await agent.put("/api/users/profile").send({
        name: "Updated Name",
        email: "updated@example.com",
      });
      expect(updateRes.statusCode).to.equal(200);
      expect(updateRes.body).to.have.property("name");
      expect(updateRes.body).to.have.property("email");
    });

    it("should return 401 if the user is not authenticated", async function () {
      const updateRes = await supertest(app).put("/api/users/profile").send({
        name: "Updated Name",
        email: "updated@example.com",
      });
      expect(updateRes.statusCode).to.equal(401);
    });
  });
});
