import supertest from "supertest";
import { expect } from "chai";
import app from "../backend/server.js";
import User from "../backend/models/userModel.js";
import Recipe from "../backend/models/recipeModel.js";
import Family from "../backend/models/familyModel.js";
import {
  loadUsers,
  loadFamilies,
  loadRecipes,
  clearUsers,
  clearFamilies,
  clearRecipes,
} from "./fixtures/loadFixtures.js";
import {
  userFixtures,
  familyFixtures,
  recipeFixtures,
} from "./fixtures/mockDataDB.js";

const login = async (agent, user) => {
  const res = await agent
    .post("/api/users/auth")
    .send({ email: user.email, password: user.password });
  // Check if the response is successful
  expect(res.statusCode).to.equal(200);
  // Check cookie
  expect(res.headers["set-cookie"]).to.exist;
  return res;
};

let agent;

beforeEach(() => {
  agent = supertest.agent(app);
});

describe("User API", () => {
  describe("Register new user: POST /api/users", () => {
    beforeEach(async function () {
      await loadUsers();
    });
    afterEach(async function () {
      await clearUsers();
    });

    const newUser = {
      name: "New User",
      email: "new@example.com",
      password: "password",
      username: "newuser",
    };

    it("should create a new user and verify it was added to the database", async function () {
      // Create the user
      const res = await agent.post("/api/users").send(newUser);
      expect(res.statusCode).to.equal(201);
      expect(res.body.message).to.equal("User created");
      // Verify the response
      expect(res.body.user.name).to.equal(newUser.name);
      expect(res.body.user.email).to.equal(newUser.email);
      expect(res.body.user.username).to.equal(newUser.username);
      //changetodo: change it to provide a message and then the user
      // Verify the user was added to the database
      const userInDb = await User.findOne({ username: newUser.username });
      expect(userInDb).to.exist;
      expect(userInDb.name).to.equal(newUser.name);
      expect(userInDb.email).to.equal(newUser.email);
      expect(userInDb.username).to.equal(newUser.username);
      // Verify the cookie was set
      expect(res.headers["set-cookie"]).to.exist;
    });

    it("should return 400 (User already exists with this email) if email already exists", async function () {
      const res = await agent.post("/api/users").send({
        name: newUser.name,
        email: userFixtures[0].email,
        password: newUser.password,
        username: newUser.username,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("User already exists with this email");
    });
    it("should return 400 (Username already taken) if username already exists", async function () {
      const res = await agent.post("/api/users").send({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        username: userFixtures[0].username,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Username already taken");
    });
    it("should return 400 if name is missing", async function () {
      const res = await agent.post("/api/users").send({
        email: newUser.email,
        password: newUser.password,
        username: newUser.username,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });
    it("should return 400 if email is missing", async function () {
      const res = await agent.post("/api/users").send({
        name: newUser.name,
        password: newUser.password,
        username: newUser.username,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });
    it("should return 400 if password is missing", async function () {
      const res = await agent.post("/api/users").send({
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });
    it("should return 400 if username is missing", async function () {
      const res = await agent.post("/api/users").send({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });
  });

  describe("Login: POST /api/users/login", () => {
    beforeEach(async function () {
      await loadUsers();
    });
    afterEach(async function () {
      await clearUsers();
    });
    it("should login user and return user object and cookie", async function () {
      //login the user
      const res = await login(agent, userFixtures[0]);
      // Verify the response
      expect(res.body.user.email).to.equal(userFixtures[0].email);
    });
    it("should return 400 if email is missing", async function () {
      const res = await agent.post("/api/users/auth").send({
        password: userFixtures[0].password,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });
    it("should return 400 if password is missing", async function () {
      const res = await agent.post("/api/users/auth").send({
        email: userFixtures[0].email,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });
    it("should return 401 if email is incorrect", async function () {
      const res = await agent.post("/api/users/auth").send({
        email: "incorrect@example.com",
        password: userFixtures[0].password,
      });
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Invalid email or password");
    });
    it("should return 401 if password is incorrect", async function () {
      const res = await agent.post("/api/users/auth").send({
        email: userFixtures[0].email,
        password: "incorrect",
      });
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Invalid email or password");
    });
  });

  describe("Logout: POST /api/users/logout", () => {
    beforeEach(async function () {
      await loadUsers();
    });
    afterEach(async function () {
      await clearUsers();
    });

    it("should logout the user and clear the session", async function () {
      // Login
      await login(agent, userFixtures[0]);

      // Logout
      const logoutRes = await agent.post("/api/users/logout");
      expect(logoutRes.statusCode).to.equal(200);
      expect(logoutRes.body.message).to.equal("Logged out successufuly");

      // Try to access a route that requires authentication
      const protectedRes = await agent.get("/api/users/profile");
      expect(protectedRes.statusCode).to.equal(401);

      // Check cookie
      expect(protectedRes.headers["set-cookie"]).to.not.exist;
    });
    it("should clear cookie even if user is not logged in", async function () {
      const logoutRes = await supertest(app).post("/api/users/logout");
      expect(logoutRes.statusCode).to.equal(200);
      expect(logoutRes.body.message).to.equal("Logged out successufuly");
    });
  });

  describe("Get user profile: GET /api/users/profile", () => {
    beforeEach(async function () {
      await loadUsers();
    });
    afterEach(async function () {
      await clearUsers();
    });

    it("should return the user's profile", async function () {
      // Log in the user
      await login(agent, userFixtures[0]);

      // Get the user's profile
      const profileRes = await agent.get("/api/users/profile");
      expect(profileRes.statusCode).to.equal(200);
      expect(profileRes.body.user).to.have.property("name");
      expect(profileRes.body.user).to.have.property("email");
      expect(profileRes.body.user).to.have.property("username");
      expect(profileRes.body.user).to.not.have.property("password");
    });
    it("should return 401 if the user is not authenticated", async function () {
      const profileRes = await supertest(app).get("/api/users/profile");
      expect(profileRes.statusCode).to.equal(401);
    });
  });

  describe("Update user profile: PUT /api/users/profile", () => {
    beforeEach(async function () {
      await loadUsers();
    });
    afterEach(async function () {
      await clearUsers();
    });

    const updatedUser = {
      name: "Updated Name",
      email: "updated@example.com",
      username: "updateduser",
      password: "updatedpassword",
    };

    it("should update the user's profile", async function () {
      // Log in the user
      await login(agent, userFixtures[0]);
      // Update the user's profile
      const updateRes = await agent.put("/api/users/profile").send(updatedUser);
      expect(updateRes.statusCode).to.equal(200);
      expect(updateRes.body.message).to.equal("User updated");
      // Check if the response is correct
      expect(updateRes.body.user).to.have.property("name");
      expect(updateRes.body.user).to.have.property("email");
      expect(updateRes.body.user).to.have.property("username");
      expect(updateRes.body.user).to.not.have.property("password");
      // See if db was updated
      const updatedUserRes = await User.findOne({ email: updatedUser.email });
      expect(updatedUserRes).to.exist;
      expect(updatedUserRes.name).to.equal(updatedUser.name);
      expect(updatedUserRes.email).to.equal(updatedUser.email);
      expect(updatedUserRes.username).to.equal(updatedUser.username);
    });
    it("should return 401 if the user is not authenticated", async function () {
      const updateRes = await supertest(app)
        .put("/api/users/profile")
        .send(updatedUser);
      expect(updateRes.statusCode).to.equal(401);
    });
  });

  describe("Add favorite recipe: POST /api/users/favorites/add/:recipe_id", () => {
    before(async function () {
      await loadFamilies();
    });
    after(async function () {
      await clearFamilies();
    });
    beforeEach(async function () {
      await loadUsers();
      await loadRecipes();
      await login(agent, userFixtures[0]);
    });
    afterEach(async function () {
      await clearUsers();
      await clearRecipes();
    });

    it("should add a recipe to the user's favorites", async function () {
      // Add a recipe to the user's favorites
      const addFavoriteRes = await agent.post(
        `/api/users/favorites/add/${recipeFixtures[3]._id.toString()}`
      );
      expect(addFavoriteRes.body.message).to.equal("Recipe added to favorites");
      expect(addFavoriteRes.statusCode).to.equal(201);
      // Check if the recipe was added to the user's favorites
      const updatedUser = await User.findOne({ email: userFixtures[0].email });
      expect(updatedUser.favorites).to.include(recipeFixtures[3]._id);
    });
    it("should return 400 if recipe is already in favorites", async function () {
      // Try to add the recipe to the user's favorites
      const addFavoriteRes = await agent.post(
        `/api/users/favorites/add/${recipeFixtures[0]._id.toString()}`
      );
      expect(addFavoriteRes.statusCode).to.equal(400);
      expect(addFavoriteRes.body.message).to.equal(
        "Recipe already in favorites"
      );
    });
    it("should return 401 if the user is not authenticated", async function () {
      const addFavoriteRes = await supertest(app).post(
        `/api/users/favorites/add/${recipeFixtures[1]._id.toString()}`
      );
      expect(addFavoriteRes.statusCode).to.equal(401);
    });
    it("should return 404 if recipe doesn't exist", async function () {
      const addFavoriteRes = await agent.post(
        `/api/users/favorites/add/invalidId`
      );
      expect(addFavoriteRes.statusCode).to.equal(404);
    });
    it("should return 403 if the user shouldn't have access to the recipe", async function () {
      const addFavoriteRes = await agent.post(
        `/api/users/favorites/add/${recipeFixtures[2]._id.toString()}`
      );
      expect(addFavoriteRes.statusCode).to.equal(403);
    });
  });

  describe("Remove favorite recipe: POST /api/users/favorites/remove/:recipe_id", () => {
    before(async function () {
      await loadFamilies();
    });
    after(async function () {
      await clearFamilies();
    });
    beforeEach(async function () {
      await loadUsers();
      await loadRecipes();
      await login(agent, userFixtures[0]);
    });
    afterEach(async function () {
      await clearUsers();
      await clearRecipes();
    });

    beforeEach(async function () {
      await login(agent, userFixtures[0]);
    });
    it("should remove a recipe to the user's favorites", async function () {
      // Remove to the user's favorites
      const removeFavoriteRes = await agent.post(
        `/api/users/favorites/remove/${recipeFixtures[0]._id.toString()}`
      );
      expect(removeFavoriteRes.statusCode).to.equal(200);
      // Check if the recipe was removed from the user's favorites
      const updatedUser = await User.findOne({ email: userFixtures[0].email });
      expect(updatedUser.favorites).to.not.include(
        recipeFixtures[0]._id.toString()
      );
    });
    it("should return 400 if recipe is not in favorites", async function () {
      // Remove to the user's favorites
      const addFavoriteRes = await agent.post(
        `/api/users/favorites/remove/${recipeFixtures[3]._id.toString()}`
      );
      expect(addFavoriteRes.statusCode).to.equal(400);
      expect(addFavoriteRes.body.message).to.equal("Recipe not in favorites");
    });
    it("should return 401 if the user is not authenticated", async function () {
      const addFavoriteRes = await supertest(app).post(
        `/api/users/favorites/remove/${recipeFixtures[0]._id.toString()}`
      );
      expect(addFavoriteRes.statusCode).to.equal(401);
    });
  });

  describe("Delete User: DELETE /api/users", () => {
    beforeEach(async function () {
      await loadUsers();
      await loadFamilies();
      await login(agent, userFixtures[0]);
    });
    afterEach(async function () {
      await clearUsers();
      await clearFamilies();
    });
    it("should delete the user, remove it from families, if last admin delete the family, delete the recipes and remove user invites from families", async function () {
      // Delete the user
      const deleteRes = await agent.delete("/api/users");
      expect(deleteRes.statusCode).to.equal(200);
      // Check if the user was deleted from the database
      const deletedUser = await User.findOne({ email: userFixtures[0].email });
      expect(deletedUser).to.not.exist;
      // Check if the user was removed from the family
      const updatedFamily = await Family.findOne({
        _id: familyFixtures[1]._id,
      });
      expect(updatedFamily.members).to.not.include(userFixtures[1]._id);
      // Check if the user invites were removed from the families
      expect(updatedFamily.invites).to.not.include(userFixtures[0]._id);
      // Check if the family with last admin was deleted
      const deletedFamily = await Family.findOne({
        _id: familyFixtures[0]._id,
      });
      expect(deletedFamily).to.not.exist;
      // Check if the user recipes were deleted
      const deletedRecipes = await Recipe.find({
        creator_id: userFixtures[0]._id,
      });
      expect(deletedRecipes).to.have.lengthOf(0);
    });
    it("should return 401 if the user is not authenticated", async function () {
      const deleteRes = await supertest(app).delete("/api/users");
      expect(deleteRes.statusCode).to.equal(401);
    });
  });

  describe("Accept invite: POST /api/users/invites/accept/:invite_id", () => {
    beforeEach(async function () {
      await loadUsers();
      await loadFamilies();
      await login(agent, userFixtures[2]);
    });
    afterEach(async function () {
      await clearUsers();
      await clearFamilies();
    });

    it("should accept the invite", async function () {
      const user = await User.findOne({ email: userFixtures[2].email });
      const inviteId = user.invites[0]._id;
      // Accept an invite
      const acceptInviteRes = await agent.post(
        `/api/users/invites/accept/${inviteId}`
      );
      expect(acceptInviteRes.statusCode).to.equal(200);
      expect(acceptInviteRes.body.message).to.equal("Invite accepted");
      // Check if the invite was removed from the user's invites
      const updatedUser = await User.findOne({ email: userFixtures[2].email });
      expect(updatedUser.invites).to.not.include(inviteId);
      // Check if the user was added to the family and the invite was removed
      const updatedFamily = await Family.findOne({
        _id: familyFixtures[0]._id,
      });
      expect(
        updatedFamily.members.some(
          (member) => member.user_id.toString() === user._id.toString()
        )
      ).to.be.true;
      expect(updatedFamily.invites).to.not.include(user._id.toString());
    });
    it("should return 400 if invite_id is incorrect", async function () {
      const acceptInviteRes = await agent.post(
        "/api/users/invites/accept/invalidId"
      );
      expect(acceptInviteRes.statusCode).to.equal(400);
    });
    it("should return 400 if invite is not in family invites, and delete user invite", async function () {
      const user = await User.findOne({ email: userFixtures[2].email });
      const inviteId = user.invites[0]._id;
      // Delete invite from family db
      const updatedFamily = await Family.findOne({
        _id: familyFixtures[0]._id,
      });
      updatedFamily.invites = [];
      await updatedFamily.save();
      // Accept an invite
      const acceptInviteRes = await agent.post(
        `/api/users/invites/accept/${inviteId}`
      );
      expect(acceptInviteRes.statusCode).to.equal(400);
      // Check if the invite was removed from the user's invites
      const updatedUser = await User.findOne({ email: userFixtures[2].email });
      expect(updatedUser.invites).to.not.include(inviteId);
    });
    it("should return 401 if the user is not authenticated", async function () {
      const inviteId = "some-invite-id"; // Replace with a valid invite ID
      const acceptInviteRes = await supertest(app).post(
        "/api/users/invites/accept/randomId"
      );
      expect(acceptInviteRes.statusCode).to.equal(401);
    });
  });

  describe("Decline invite: POST /api/users/invites/decline/:invite_id", () => {
    beforeEach(async function () {
      await loadUsers();
      await loadFamilies();
      await login(agent, userFixtures[2]);
    });
    afterEach(async function () {
      await clearUsers();
      await clearFamilies();
    });

    it("should decline the invite", async function () {
      const user = await User.findOne({ email: userFixtures[2].email });
      const inviteId = user.invites[0]._id;
      // Decline an invite
      const declineInviteRes = await agent.post(
        `/api/users/invites/decline/${inviteId}`
      );
      expect(declineInviteRes.statusCode).to.equal(200);
      expect(declineInviteRes.body.message).to.equal("Invite declined");
      // Check if the invite was removed from the user's invites
      const updatedUser = await User.findOne({ email: userFixtures[2].email });
      expect(updatedUser.invites).to.not.include(inviteId);
      // Check if the user was not added to the family
      const updatedFamily = await Family.findOne({
        _id: familyFixtures[0]._id,
      });
      expect(
        updatedFamily.members.some(
          (member) => member.user_id.toString() === user._id.toString()
        )
      ).to.be.false;
      expect(updatedFamily.invites).to.not.include(user._id.toString());
    });
    it("should return 400 if invite_id is incorrect", async function () {
      const declineInviteRes = await agent.post(
        "/api/users/invites/decline/invalidId"
      );
      expect(declineInviteRes.statusCode).to.equal(400);
      expect(declineInviteRes.body.message).to.equal("Invite not valid");
    });
    it("should return 401 if the user is not authenticated", async function () {
      const declineInviteRes = await supertest(app).post(
        "/api/users/invites/decline/randomId"
      );
      expect(declineInviteRes.statusCode).to.equal(401);
    });
  });
});
