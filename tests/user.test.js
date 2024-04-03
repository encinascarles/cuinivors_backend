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
  loadFixtures,
  clearUsers,
  clearFamilies,
  clearRecipes,
  clearFixtures,
} from "./fixtures/loadFixtures.js";
import {
  userFixtures,
  familyFixtures,
  recipeFixtures,
} from "./fixtures/mockDataDB.js";
import Invite from "../backend/models/inviteModel.js";

const registerURL = "/api/users/register";
const loginURL = "/api/users/auth";
const logoutURL = "/api/users/logout";
const profileURL = "/api/users/profile";
const userFamiliesURL = "/api/users/families";
const userRecipesURL = "/api/users/recipes";
const deleteURL = "/api/users";

const login = async (agent, user) => {
  const res = await agent
    .post(loginURL)
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
  //to test with postman
  after(async function () {
    await loadFixtures();
  });

  describe("Register new user: POST /api/users/register", () => {
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
      const res = await agent.post(registerURL).send(newUser);
      expect(res.statusCode).to.equal(201);
      expect(res.body.message).to.equal("User created");
      // Verify the response
      expect(res.body.user).to.include({
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      });
      expect(res.body.user).to.not.have.property("password");
      // Verify the user was added to the database
      const userInDb = await User.findOne({ username: newUser.username });
      expect(userInDb).to.exist;
      expect(userInDb).to.include({
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      });
      expect(res.body.user).to.not.have.property("password");
      // Verify the cookie was set
      expect(res.headers["set-cookie"]).to.exist;
    });

    it("should return 400 (User already exists with this email) if email already exists", async function () {
      const res = await agent.post(registerURL).send({
        name: newUser.name,
        email: userFixtures[0].email,
        password: newUser.password,
        username: newUser.username,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("User already exists with this email");
    });
    it("should return 400 (Username already taken) if username already exists", async function () {
      const res = await agent.post(registerURL).send({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        username: userFixtures[0].username,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal(
        "User already exists with this username"
      );
    });
    it("should return 400 if name is missing", async function () {
      const res = await agent.post(registerURL).send({
        email: newUser.email,
        password: newUser.password,
        username: newUser.username,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });
    it("should return 400 if email is missing", async function () {
      const res = await agent.post(registerURL).send({
        name: newUser.name,
        password: newUser.password,
        username: newUser.username,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });
    it("should return 400 if password is missing", async function () {
      const res = await agent.post(registerURL).send({
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });
    it("should return 400 if username is missing", async function () {
      const res = await agent.post(registerURL).send({
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
      expect(res.body.user).to.include({
        name: userFixtures[0].name,
        email: userFixtures[0].email,
        username: userFixtures[0].username,
        profile_image: userFixtures[0].profile_image,
      });
      expect(res.body.user).to.not.have.property("password");
    });
    it("should return 400 if email is missing", async function () {
      const res = await agent.post(loginURL).send({
        password: userFixtures[0].password,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });
    it("should return 400 if password is missing", async function () {
      const res = await agent.post(loginURL).send({
        email: userFixtures[0].email,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });
    it("should return 401 if email is incorrect", async function () {
      const res = await agent.post(loginURL).send({
        email: "incorrect@example.com",
        password: userFixtures[0].password,
      });
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Invalid email or password");
    });
    it("should return 401 if password is incorrect", async function () {
      const res = await agent.post(loginURL).send({
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
      const logoutRes = await agent.post(logoutURL);
      expect(logoutRes.statusCode).to.equal(200);
      expect(logoutRes.body.message).to.equal("Logged out successfully");

      // Try to access a route that requires authentication
      const protectedRes = await agent.get(profileURL);
      expect(protectedRes.statusCode).to.equal(401);

      // Check cookie
      expect(protectedRes.headers["set-cookie"]).to.not.exist;
    });
    it("should clear cookie even if user is not logged in", async function () {
      const logoutRes = await supertest(app).post(logoutURL);
      expect(logoutRes.statusCode).to.equal(200);
      expect(logoutRes.body.message).to.equal("Logged out successfully");
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
      const profileRes = await agent.get(profileURL);
      expect(profileRes.statusCode).to.equal(200);
      expect(profileRes.body.user).to.include({
        name: userFixtures[0].name,
        email: userFixtures[0].email,
        username: userFixtures[0].username,
        profile_image: userFixtures[0].profile_image,
      });
      expect(profileRes.body.user).to.not.have.property("password");
    });
    it("should return 401 if the user is not authenticated", async function () {
      const profileRes = await supertest(app).get(profileURL);
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
      const updateRes = await agent.put(profileURL).send(updatedUser);
      expect(updateRes.statusCode).to.equal(200);
      expect(updateRes.body.message).to.equal("User updated");
      // Check if the response is correct
      expect(updateRes.body.user).to.include({
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        profile_image: userFixtures[0].profile_image,
      });
      expect(updateRes.body.user).to.not.have.property("password");
      // See if db was updated
      const updatedUserRes = await User.findOne({ email: updatedUser.email });
      expect(updatedUserRes).to.exist;
      expect(updatedUserRes).to.include({
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        profile_image: userFixtures[0].profile_image,
      });
    });
    it("should return 401 if the user is not authenticated", async function () {
      const updateRes = await supertest(app).put(profileURL).send(updatedUser);
      expect(updateRes.statusCode).to.equal(401);
    });
  });

  describe("Get user profile by id: GET /api/users/profile/:user_id", () => {
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
      const profileRes = await agent.get(
        profileURL + "/" + userFixtures[1]._id.toString()
      );
      expect(profileRes.statusCode).to.equal(200);
      expect(profileRes.body.user).to.include({
        name: userFixtures[1].name,
        email: userFixtures[1].email,
        username: userFixtures[1].username,
        profile_image: userFixtures[1].profile_image,
      });
      expect(profileRes.body.user).to.not.have.property("password");
    });
  });

  describe("Get user families: GET /api/users/families", () => {
    beforeEach(async function () {
      await loadUsers();
      await loadFamilies();
    });
    afterEach(async function () {
      await clearUsers();
      await clearFamilies();
    });

    it("should return the user's families", async function () {
      // Log in the user
      await login(agent, userFixtures[0]);

      // Get the user's families
      const familiesRes = await agent.get(userFamiliesURL);
      expect(familiesRes.statusCode).to.equal(200);
      expect(familiesRes.body.families).to.have.lengthOf(2);
      expect(familiesRes.body.families[0]).to.include({
        name: familyFixtures[0].name,
        description: familyFixtures[0].description,
        family_image: familyFixtures[0].family_image,
      });
    });
    it("should return 401 if the user is not authenticated", async function () {
      const familiesRes = await supertest(app).get(userFamiliesURL);
      expect(familiesRes.statusCode).to.equal(401);
    });
  });

  describe("Get user recipes: GET /api/users/recipes", () => {
    beforeEach(async function () {
      await loadUsers();
      await loadRecipes();
    });
    afterEach(async function () {
      await clearUsers();
      await clearRecipes();
    });

    it("should return the user's recipes", async function () {
      // Log in the user
      await login(agent, userFixtures[0]);

      // Get the user's recipes
      const recipesRes = await agent.get(userRecipesURL);
      expect(recipesRes.statusCode).to.equal(200);
      expect(recipesRes.body.recipes).to.have.lengthOf(1);
      expect(recipesRes.body.recipes[0]).to.deep.include({
        name: recipeFixtures[0].name,
        prep_time: recipeFixtures[0].prep_time,
        total_time: recipeFixtures[0].total_time,
        ingredients: recipeFixtures[0].ingredients,
        steps: recipeFixtures[0].steps,
        recommendations: recipeFixtures[0].recommendations,
        origin: recipeFixtures[0].origin,
        recipe_image: recipeFixtures[0].recipe_image,
        visibility: recipeFixtures[0].visibility,
      });
    });
    it("should return 401 if the user is not authenticated", async function () {
      const recipesRes = await supertest(app).get(userRecipesURL);
      expect(recipesRes.statusCode).to.equal(401);
    });
  });

  describe("Delete User: DELETE /api/users", () => {
    beforeEach(async function () {
      await loadFixtures();
      await login(agent, userFixtures[0]);
    });
    afterEach(async function () {
      await clearFixtures();
    });
    it("should delete the user, remove it from families, if last admin delete the family, delete the recipes and remove user invites", async function () {
      // Delete the user
      const deleteRes = await agent.delete(deleteURL);
      expect(deleteRes.statusCode).to.equal(200);
      expect(deleteRes.body.message).to.equal("User deleted");
      // Check if the user was deleted from the database
      const deletedUser = await User.findOne({ email: userFixtures[0].email });
      expect(deletedUser).to.not.exist;
      // Check if the user was removed from the families
      const updatedFamily = await Family.findOne({
        _id: familyFixtures[1]._id,
      });
      expect(updatedFamily.members).to.not.include(userFixtures[0]._id);
      // Check if the family with last admin was deleted
      const deletedFamily = await Family.findOne({
        _id: familyFixtures[0]._id,
      });
      expect(deletedFamily).to.not.exist;
      // Check if the user recipes were deleted
      const deletedRecipes = await Recipe.find({
        author_id: userFixtures[0]._id,
      });
      expect(deletedRecipes).to.have.lengthOf(0);
      // Check if the user invites were deleted
      const userInvites = await Invite.find({
        $or: [
          { inviter_user_id: userFixtures[0]._id },
          { invitee_user_id: userFixtures[0]._id },
        ],
      });
    });
    it("should return 401 if the user is not authenticated", async function () {
      const deleteRes = await supertest(app).delete(deleteURL);
      expect(deleteRes.statusCode).to.equal(401);
    });
  });
});
