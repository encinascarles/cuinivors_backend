import supertest from "supertest";
import { expect } from "chai";
import app from "../backend/server.js";
import User from "../backend/models/userModel.js";
import Recipe from "../backend/models/recipeModel.js";
import Family from "../backend/models/familyModel.js";

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
        email: newUser.email,
        password: newUser.password,
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

      // See if db was updated
      const updatedUser = await User.findOne({ email: "updated@example.com" });
      expect(updatedUser).to.exist;
      expect(updatedUser.name).to.equal("Updated Name");
      expect(updatedUser.email).to.equal("updated@example.com");

      //delete the user from the database
      await User.deleteOne({ email: "updated@example.com" });
    });

    it("should return 401 if the user is not authenticated", async function () {
      const updateRes = await supertest(app).put("/api/users/profile").send({
        name: "Updated Name",
        email: "updated@example.com",
      });
      expect(updateRes.statusCode).to.equal(401);
    });
  });
  describe("Add favorite recipe: POST /api/users/favorites/add", () => {
    beforeEach(async function () {
      // Log in the user
      const loginRes = await agent.post("/api/users/auth").send({
        email: mockUser.email,
        password: mockUser.password,
      });
      expect(loginRes.statusCode).to.equal(200);
    });
    it("should add a recipe to the user's favorites", async function () {
      //Get the user's id
      const user = await User.findOne({ email: mockUser.email });

      // Add a recipe to the database
      const recipe = await Recipe.create({
        name: "Test Recipe",
        description: "Test Description",
        ingredients: ["Test Ingredient 1", "Test Ingredient 2"],
        directions: ["Test Direction 1", "Test Direction 2"],
        category: "Test Category",
        prep_time: 10,
        total_time: 20,
        servings: 4,
        creator_id: user._id,
      });
      // Add a recipe to the user's favorites
      const recipeId = recipe._id; // Replace with a valid recipe ID
      const addFavoriteRes = await agent
        .post("/api/users/favorites/add")
        .send({ recipe_id: recipeId });
      expect(addFavoriteRes.statusCode).to.equal(201);
      // Check if the recipe was added to the user's favorites
      const updatedUser = await User.findOne({ email: mockUser.email });
      expect(updatedUser.favorites).to.include(recipeId);
      //delete from the database
      await Recipe.deleteOne({ _id: recipeId });
      User.updateOne(
        { email: mockUser.email },
        { $pull: { favorites: recipeId } }
      );
    });
    it("should return 400 if recipe_id is missing", async function () {
      const addFavoriteRes = await agent.post("/api/users/favorites/add");
      expect(addFavoriteRes.statusCode).to.equal(400);
    });
    it("should return 400 if recipe is already in favorites", async function () {
      //Get the user's id
      const user = await User.findOne({ email: mockUser.email });
      //Add a recipe to the database
      const recipe = await Recipe.create({
        name: "Test Recipe",
        description: "Test Description",
        ingredients: ["Test Ingredient 1", "Test Ingredient 2"],
        directions: ["Test Direction 1", "Test Direction 2"],
        category: "Test Category",
        prep_time: 10,
        total_time: 20,
        servings: 4,
        creator_id: user._id,
      });
      // Add the recipe to the user's favorites using the database
      await User.updateOne(
        { email: mockUser.email },
        { $push: { favorites: recipe._id } }
      );
      // Try to add the recipe to the user's favorites
      const addFavoriteRes = await agent
        .post("/api/users/favorites/add")
        .send({ recipe_id: recipe._id });
      expect(addFavoriteRes.statusCode).to.equal(400);
      expect(addFavoriteRes.body.message).to.equal(
        "Recipe already in favorites"
      );
      //delete from the database
      await Recipe.deleteOne({ _id: recipe._id });
      User.updateOne(
        { email: mockUser.email },
        { $pull: { favorites: recipe._id } }
      );
    });
    it("should return 400 if recipe_id is missing", async function () {
      const addFavoriteRes = await agent.post("/api/users/favorites/add");
      expect(addFavoriteRes.statusCode).to.equal(400);
    });
    it("should return 401 if the user is not authenticated", async function () {
      const recipeId = "some-recipe-id"; // Replace with a valid recipe ID
      const addFavoriteRes = await supertest(app)
        .post("/api/users/favorites/add")
        .send({ recipeId });
      expect(addFavoriteRes.statusCode).to.equal(401);
    });
  });
  describe("Remove favorite recipe: POST /api/users/favorites/remove", () => {
    beforeEach(async function () {
      // Log in the user
      const loginRes = await agent.post("/api/users/auth").send({
        email: mockUser.email,
        password: mockUser.password,
      });
      expect(loginRes.statusCode).to.equal(200);
    });
    it("should remove a recipe to the user's favorites", async function () {
      //Get the user's id
      const user = await User.findOne({ email: mockUser.email });

      // Add a recipe to the database
      const recipe = await Recipe.create({
        name: "Test Recipe",
        description: "Test Description",
        ingredients: ["Test Ingredient 1", "Test Ingredient 2"],
        directions: ["Test Direction 1", "Test Direction 2"],
        category: "Test Category",
        prep_time: 10,
        total_time: 20,
        servings: 4,
        creator_id: user._id,
      });
      // Add the recipe to the user's favorites using the database
      await User.updateOne(
        { email: mockUser.email },
        { $push: { favorites: recipe._id } }
      );
      // Remove the recipe to the user's favorites
      const recipeId = recipe._id;
      const addFavoriteRes = await agent
        .post("/api/users/favorites/remove")
        .send({ recipe_id: recipeId });
      expect(addFavoriteRes.statusCode).to.equal(201);
      // Check if the recipe was removed to the user's favorites
      const updatedUser = await User.findOne({ email: mockUser.email });
      expect(updatedUser.favorites).to.not.include(recipeId);
      //delete from the database
      await Recipe.deleteOne({ _id: recipeId });
      User.updateOne(
        { email: mockUser.email },
        { $pull: { favorites: recipeId } }
      );
    });
    it("should return 400 if recipe_id is missing", async function () {
      const addFavoriteRes = await agent.post("/api/users/favorites/remove");
      expect(addFavoriteRes.statusCode).to.equal(400);
    });
    it("should return 400 if recipe is not in favorites", async function () {
      //Get the user's id
      const user = await User.findOne({ email: mockUser.email });
      //Add a recipe to the database
      const recipe = await Recipe.create({
        name: "Test Recipe",
        description: "Test Description",
        ingredients: ["Test Ingredient 1", "Test Ingredient 2"],
        directions: ["Test Direction 1", "Test Direction 2"],
        category: "Test Category",
        prep_time: 10,
        total_time: 20,
        servings: 4,
        creator_id: user._id,
      });
      // Try to remove the recipe from the user's favorites
      const addFavoriteRes = await agent
        .post("/api/users/favorites/remove")
        .send({ recipe_id: recipe._id });
      expect(addFavoriteRes.statusCode).to.equal(400);
      expect(addFavoriteRes.body.message).to.equal("Recipe not in favorites");
      //delete from the database
      await Recipe.deleteOne({ _id: recipe._id });
    });
    it("should return 400 if recipe_id is missing", async function () {
      const addFavoriteRes = await agent.post("/api/users/favorites/remove");
      expect(addFavoriteRes.statusCode).to.equal(400);
    });
    it("should return 401 if the user is not authenticated", async function () {
      const recipeId = "some-recipe-id"; // Replace with a valid recipe ID
      const addFavoriteRes = await supertest(app)
        .post("/api/users/favorites/remove")
        .send({ recipeId });
      expect(addFavoriteRes.statusCode).to.equal(401);
    });
  });
  describe("Delete User: DELETE /api/users", () => {
    it("should delete the user", async function () {
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
        email: newUser.email,
        password: newUser.password,
      });
      expect(loginRes.statusCode).to.equal(200);
      // Delete the user
      const deleteRes = await agent.delete("/api/users");
      expect(deleteRes.statusCode).to.equal(200);
      // Check if the user was deleted from the database
      const deletedUser = await User.findOne({ email: newUser.email });
      expect(deletedUser).to.not.exist;
      // Delete from the database
      await User.deleteOne({ email: newUser.email });
    });
    it("should remove user from families", async function () {
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
        email: newUser.email,
        password: newUser.password,
      });
      expect(loginRes.statusCode).to.equal(200);
      // Create a family in the database
      const family = await Family.create({
        name: "Test Family",
        description: "Test Description",
        creator_id: "66086312b25899e1bc2a8776",
      });
      // Add the user to the family
      family.members.push({ user_id: newUser._id });
      await family.save();
      // Delete the user
      const deleteRes = await agent.delete("/api/users");
      expect(deleteRes.statusCode).to.equal(200);
      // Check if the user was deleted from the database
      const deletedUser = await User.findOne({ email: newUser.email });
      expect(deletedUser).to.not.exist;
      // Check if the user was removed from the family
      const updatedFamily = await Family.findOne({ _id: family._id });
      expect(updatedFamily.members).to.not.include(newUser._id);
      // Delete from the database
      await User.deleteOne({ email: newUser.email });
      await Family.deleteOne({ _id: family._id });
    });
    it("should remove user invites from families", async function () {
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
        email: newUser.email,
        password: newUser.password,
      });
      expect(loginRes.statusCode).to.equal(200);
      // Create a family in the database
      const family = await Family.create({
        name: "Test Family",
        description: "Test Description",
        creator_id: "66086312b25899e1bc2a8776",
      });
      // Add an invite
      family.invites.push({ user_id: newUser._id });
      await family.save();
      // Delete the user
      const deleteRes = await agent.delete("/api/users");
      expect(deleteRes.statusCode).to.equal(200);
      // Check if the user was deleted from the database
      const deletedUser = await User.findOne({ email: newUser.email });
      expect(deletedUser).to.not.exist;
      // Check if the user invite was removed from the family
      const updatedFamily = await Family.findOne({ _id: family._id });
      expect(updatedFamily.invites).to.not.include(newUser._id);
      // Delete from the database
      await User.deleteOne({ email: newUser.email });
      await Family.deleteOne({ _id: family._id });
    });
    it("should return 401 if the user is not authenticated", async function () {
      const deleteRes = await supertest(app).delete("/api/users");
      expect(deleteRes.statusCode).to.equal(401);
    });
  });
  describe("Accept invite: POST /api/users/invites/accept", () => {
    it("should accept the invite", async function () {
      // Log in the user
      const loginRes = await agent.post("/api/users/auth").send({
        email: mockUser.email,
        password: mockUser.password,
      });
      expect(loginRes.statusCode).to.equal(200);
      // Get the user
      const user = await User.findOne({ email: mockUser.email });
      // Create a family in the database
      const family = await Family.create({
        name: "Test Family",
        description: "Test Description",
        creator_id: "66086312b25899e1bc2a8776",
      });
      // Create an invite in the family database
      family.invites.push({ user_id: user._id });
      await family.save();
      // Create an invite in the user database
      user.invites.push({
        family_id: family._id,
        inviter_id: "66086312b25899e1bc2a8776",
      });
      await user.save();
      // Get the invite ID
      const inviteId = user.invites[0]._id;
      // Accept an invite
      const acceptInviteRes = await agent
        .post("/api/users/invites/accept")
        .send({ inviteId });
      expect(acceptInviteRes.statusCode).to.equal(200);
      // Check if the invite was removed from the user's invites
      const updatedUser = await User.findOne({ email: mockUser.email });
      expect(updatedUser.invites).to.not.include(inviteId);
      // Check if the user was added to the family and the invite was removed
      const updatedFamily = await Family.findOne({ _id: family._id });
      expect(updatedFamily.members).to.include(user._id);
      expect(updatedFamily.invites).to.not.include(user._id);
      //delete family from the database
      await Family.deleteOne({ _id: family._id });
    });

    it("should return 401 if the user is not authenticated", async function () {
      const inviteId = "some-invite-id"; // Replace with a valid invite ID
      const acceptInviteRes = await supertest(app)
        .post("/api/users/invites/accept")
        .send({ inviteId });
      expect(acceptInviteRes.statusCode).to.equal(401);
    });

    it("should return 400 if invite_id is missing", async function () {
      const acceptInviteRes = await agent.post("/api/users/invites/accept");
      expect(acceptInviteRes.statusCode).to.equal(400);
    });
  });
});
