import supertest from "supertest";
import { expect } from "chai";
import app from "../backend/server.js";
import {
  refreshUsers,
  refreshRecipes,
  refreshFixtures,
} from "./fixtures/loadFixtures.js";
import {
  userFixtures,
  familyFixtures,
  recipeFixtures,
} from "./fixtures/mockDataDB.js";
import User from "../backend/models/userModel.js";
import Recipe from "../backend/models/recipeModel.js";
import Family from "../backend/models/familyModel.js";
import Invite from "../backend/models/inviteModel.js";

// Define the URLs
const registerURL = "/api/users/register";
const loginURL = "/api/users/auth";
const logoutURL = "/api/users/logout";
const profileURL = "/api/users/profile";
const userFamiliesURL = "/api/users/families";
const userRecipesURL = "/api/users/recipes";
const deleteURL = "/api/users";

let agent;

const login = async (user) => {
  const res = await agent
    .post(loginURL)
    .send({ email: user.email, password: user.password })
    .expect(200);
  // Check cookie
  expect(res.headers["set-cookie"]).to.exist;
  return res;
};

describe("User API", () => {
  before(async () => {
    await refreshFixtures();
    agent = supertest.agent(app);
  });

  describe("Register new user: POST /api/users/register", () => {
    afterEach(async function () {
      await refreshUsers();
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
      // Check if the response is successful
      expect(res.statusCode).to.equal(201);
      expect(res.body.message).to.equal("User created");
      // Check if the response is successful
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
      // Verify the cookie was set
      expect(res.headers["set-cookie"]).to.exist;
    });

    it("should return 400 if some data is missing", async function () {
      // Create the user without the name
      const res = await agent.post(registerURL).send({
        email: newUser.email,
        password: newUser.password,
        username: newUser.username,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });

    it("should return 400 if password is less than 8 characters", async function () {
      // Create the user with a password less than 8 characters
      const res = await agent.post(registerURL).send({
        name: newUser.name,
        email: newUser.email,
        password: "short",
        username: newUser.username,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });

    it("should return 400 if email is not valid", async function () {
      // Create the user with an invalid email
      const res = await agent.post(registerURL).send({
        name: newUser.name,
        email: "invalid",
        password: newUser.password,
        username: newUser.username,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });

    it("should return 400 if email already exists", async function () {
      // Create the user with an email that already exists
      const res = await agent.post(registerURL).send({
        name: newUser.name,
        email: userFixtures[0].email,
        password: newUser.password,
        username: newUser.username,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("User already exists with this email");
    });

    it("should return 400 if username already exists", async function () {
      // Create the user with a username that already exists
      const res = await agent.post(registerURL).send({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        username: userFixtures[0].username,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal(
        "User already exists with this username"
      );
    });
  });

  describe("Login: POST /api/users/login", () => {
    it("should login user and return user object and cookie", async function () {
      //login the user
      const res = await login(userFixtures[0]);
      // Check if the response is successful
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("User logged in");
      expect(res.body.user).to.include({
        name: userFixtures[0].name,
        email: userFixtures[0].email,
        username: userFixtures[0].username,
        profile_image: userFixtures[0].profile_image,
      });
      expect(res.body.user).to.not.have.property("password");
    });

    it("should return 400 if email is missing", async function () {
      // Login without email
      const res = await agent.post(loginURL).send({
        password: userFixtures[0].password,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });

    it("should return 400 if password is missing", async function () {
      // Login without password
      const res = await agent.post(loginURL).send({
        email: userFixtures[0].email,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });

    it("should return 400 if password is less than 8 characters", async function () {
      // Login with password less than 8 characters
      const res = await agent.post(loginURL).send({
        email: userFixtures[0].email,
        password: "short",
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });

    it("should return 401 if email doesn't exist", async function () {
      // Login with incorrect email
      const res = await agent.post(loginURL).send({
        email: "incorrect@example.com",
        password: userFixtures[0].password,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Invalid email or password");
    });

    it("should return 401 if password is incorrect", async function () {
      // Login with incorrect password
      const res = await agent.post(loginURL).send({
        email: userFixtures[0].email,
        password: "incorrect",
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Invalid email or password");
    });

    it("should return 400 if email is not valid", async function () {
      // Login with invalid email
      const res = await agent.post(loginURL).send({
        email: "invalid",
        password: userFixtures[0].password,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });
  });

  describe("Logout: POST /api/users/logout", () => {
    before(async function () {
      await login(userFixtures[0]);
    });

    it("should logout the user and clear the session", async function () {
      // Logout the user
      const logoutRes = await agent.post(logoutURL);
      // Check if the response is successful
      expect(logoutRes.statusCode).to.equal(200);
      expect(logoutRes.body.message).to.equal("Logged out successfully");
      // Try to access a route that requires authentication
      const protectedRes = await agent.get(profileURL);
      expect(protectedRes.statusCode).to.equal(401);
      // Check cookie
      expect(protectedRes.headers["set-cookie"]).to.not.exist;
    });

    it("should clear cookie even if user is not logged in", async function () {
      // Logout the user
      const logoutRes = await supertest(app).post(logoutURL);
      // Check if the response is successful
      expect(logoutRes.statusCode).to.equal(200);
      expect(logoutRes.body.message).to.equal("Logged out successfully");
    });
  });

  describe("Get user profile: GET /api/users/profile", () => {
    before(async function () {
      await login(userFixtures[0]);
    });

    it("should return the user's profile", async function () {
      // Get the user's profile
      const profileRes = await agent.get(profileURL);
      // Check if the response is successful
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
      // Get the user's profile without logging in
      const profileRes = await supertest(app).get(profileURL);
      // Check if the response is unsuccessful
      expect(profileRes.statusCode).to.equal(401);
      expect(profileRes.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("Update user profile: PUT /api/users/profile", () => {
    before(async function () {
      await login(userFixtures[0]);
    });
    afterEach(async function () {
      await refreshUsers();
    });

    const updatedUser = {
      name: "Updated Name",
      email: "updated@example.com",
      username: "updateduser",
      password: "updatedpassword",
    };

    it("should update the user's profile", async function () {
      // Update the user's profile
      const updateRes = await agent.put(profileURL).send(updatedUser);
      // Check if the response is successful
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

    it("should return 400 if email is not valid", async function () {
      // Update the user's profile with an invalid email
      const updateRes = await agent.put(profileURL).send({
        ...updatedUser,
        email: "invalid",
      });
      // Check if the response is unsuccessful
      expect(updateRes.statusCode).to.equal(400);
      expect(updateRes.body.message).to.equal("Not valid data");
    });

    it("should return 400 if password is less than 8 characters", async function () {
      // Update the user's profile with a password less than 8 characters
      const updateRes = await agent.put(profileURL).send({
        ...updatedUser,
        password: "short",
      });
      // Check if the response is unsuccessful
      expect(updateRes.statusCode).to.equal(400);
      expect(updateRes.body.message).to.equal("Not valid data");
    });

    it("should return 400 if email already exists", async function () {
      // Update the user's profile with an email that already exists
      const updateRes = await agent.put(profileURL).send({
        ...updatedUser,
        email: userFixtures[1].email,
      });
      // Check if the response is unsuccessful
      expect(updateRes.statusCode).to.equal(400);
      expect(updateRes.body.message).to.equal(
        "User already exists with this email"
      );
    });

    it("should return 400 if username already exists", async function () {
      // Update the user's profile with a username that already exists
      const updateRes = await agent.put(profileURL).send({
        ...updatedUser,
        username: userFixtures[1].username,
      });
      // Check if the response is unsuccessful
      expect(updateRes.statusCode).to.equal(400);
      expect(updateRes.body.message).to.equal(
        "User already exists with this username"
      );
    });

    it("should return 401 if the user is not authenticated", async function () {
      // Update the user's profile without logging in
      const updateRes = await supertest(app).put(profileURL).send(updatedUser);
      // Check if the response is unsuccessful
      expect(updateRes.statusCode).to.equal(401);
    });
  });

  describe("Get user profile by id: GET /api/users/profile/:user_id", () => {
    before(async function () {
      await login(userFixtures[0]);
    });

    it("should return the user's profile", async function () {
      // Get the user's profile
      const profileRes = await agent.get(
        profileURL + "/" + userFixtures[1]._id.toString()
      );
      // Check if the response is successful
      expect(profileRes.statusCode).to.equal(200);
      expect(profileRes.body.user).to.include({
        name: userFixtures[1].name,
        email: userFixtures[1].email,
        username: userFixtures[1].username,
        profile_image: userFixtures[1].profile_image,
      });
      expect(profileRes.body.user).to.not.have.property("password");
    });

    it("should return 400 if user_id is not valid", async function () {
      // Get the user's profile with a non-castable user_id
      const profileRes = await agent.get(profileURL + "/non-castable-id");
      // Check if the response is unsuccessful
      expect(profileRes.statusCode).to.equal(400);
      expect(profileRes.body.message).to.equal("Not valid data");
    });
  });

  describe("Get user families: GET /api/users/families", () => {
    before(async function () {
      await login(userFixtures[0]);
    });

    it("should return the user's families", async function () {
      // Get the user's families
      const familiesRes = await agent.get(userFamiliesURL);
      // Check if the response is successful
      expect(familiesRes.statusCode).to.equal(200);
      expect(familiesRes.body.families).to.have.lengthOf(3);
      expect(familiesRes.body.families[0]).to.include({
        name: familyFixtures[0].name,
        description: familyFixtures[0].description,
        family_image: familyFixtures[0].family_image,
      });
    });

    it("should return 401 if the user is not authenticated", async function () {
      // Get the user's families without logging in
      const familiesRes = await supertest(app).get(userFamiliesURL);
      // Check if the response is unsuccessful
      expect(familiesRes.statusCode).to.equal(401);
      expect(familiesRes.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("Get user recipes: GET /api/users/recipes", () => {
    before(async function () {
      await login(userFixtures[0]);
    });

    it("should return the user's recipes", async function () {
      // Get the user's recipes
      const recipesRes = await agent.get(userRecipesURL);
      // Check if the response is successful
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
      // Get the user's recipes without logging in
      const recipesRes = await supertest(app).get(userRecipesURL);
      // Check if the response is unsuccessful
      expect(recipesRes.statusCode).to.equal(401);
      expect(recipesRes.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("Get user favorites: GET /api/users/favorites", () => {
    before(async function () {
      await login(userFixtures[0]);
    });
    afterEach(async function () {
      await refreshUsers();
      await refreshRecipes();
    });

    it("should return the user's favorite recipes", async function () {
      // Get the user's favorite recipes
      const favoritesRes = await agent.get("/api/users/favorites");
      // Check if the response is successful
      expect(favoritesRes.statusCode).to.equal(200);
      expect(favoritesRes.body.recipes).to.have.lengthOf(1);
      expect(favoritesRes.body.recipes[0]).to.deep.include({
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

    it("should remove the recipe from the user's favorites if it is deleted", async function () {
      // Delete the recipe
      await Recipe.deleteOne({ _id: recipeFixtures[0]._id });
      // Get the user's favorite recipes
      const favoritesRes = await agent.get("/api/users/favorites");
      // Check if the response is successful
      expect(favoritesRes.statusCode).to.equal(200);
      expect(favoritesRes.body.recipes).to.have.lengthOf(0);
    });

    it("should remove the recipe from the user's favorites if he has no access anymore", async function () {
      // Add a non accessible recipe to the user's favorites
      await User.updateOne(
        { _id: userFixtures[0]._id },
        { $push: { favorites: recipeFixtures[2]._id } }
      );
      // Get the user's favorite recipes
      const favoritesRes = await agent.get("/api/users/favorites");
      // Check if the response is successful
      expect(favoritesRes.statusCode).to.equal(200);
      expect(favoritesRes.body.recipes).to.have.lengthOf(1);
    });

    it("should return 401 if the user is not authenticated", async function () {
      // Get the user's favorite recipes without logging in
      const favoritesRes = await supertest(app).get("/api/users/favorites");
      // Check if the response is unsuccessful
      expect(favoritesRes.statusCode).to.equal(401);
      expect(favoritesRes.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("Delete User: DELETE /api/users", () => {
    before(async function () {
      await login(userFixtures[0]);
    });
    afterEach(async function () {
      await refreshFixtures();
    });

    it("should delete the user, remove it from families, if last admin delete the family, delete the recipes and remove user invites", async function () {
      // Delete the user
      const deleteRes = await agent.delete(deleteURL);
      // Check if the response is successful
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
      // Delete the user without logging in
      const deleteRes = await supertest(app).delete(deleteURL);
      // Check if the response is unsuccessful
      expect(deleteRes.statusCode).to.equal(401);
      expect(deleteRes.body.message).to.equal("Not authorized, no token");
    });
  });
});
