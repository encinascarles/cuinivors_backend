import supertest from "supertest";
import { expect } from "chai";
import app from "../backend/server.js";
import {
  refreshRecipes,
  refreshUsers,
  refreshFixtures,
} from "./fixtures/loadFixtures.js";
import { userFixtures, recipeFixtures } from "./fixtures/mockDataDB.js";
import User from "../backend/models/userModel.js";
import Recipe from "../backend/models/recipeModel.js";

// Define the URLs
const loginURL = "/api/users/auth/";
const recipeURL = "/api/recipes/";

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

describe("Recipe API", () => {
  before(async () => {
    await refreshFixtures();
    agent = supertest.agent(app);
  });

  describe("Add new recipe: POST /api/recipes", () => {
    before(async function () {
      await login(userFixtures[0]);
    });
    afterEach(async function () {
      await refreshRecipes();
    });

    const newRecipe = {
      name: "New Recipe",
      prep_time: 10,
      total_time: 20,
      ingredients: JSON.stringify(["new ingredient 1", "new ingredient 2"]),
      steps: JSON.stringify(["new step 1", "new step 2"]),
      recommendations: "new recommendation",
      origin: "new origin",
      visibility: "public",
    };

    it("should create a new recipe and verify it was added to the database", async function () {
      // Create the recipe
      const res = await agent.post(recipeURL).send(newRecipe);
      // Check if the response is successful
      expect(res.statusCode).to.equal(201);
      expect(res.body.message).to.equal("Recipe created");
      expect(res.body.recipe).to.deep.include({
        name: newRecipe.name,
        prep_time: newRecipe.prep_time,
        total_time: newRecipe.total_time,
        ingredients: JSON.parse(newRecipe.ingredients),
        steps: JSON.parse(newRecipe.steps),
        recommendations: newRecipe.recommendations,
        origin: newRecipe.origin,
        visibility: newRecipe.visibility,
      });
      // Verify the recipe was added to the database
      const recipeInDb = await Recipe.findOne({ name: newRecipe.name });
      expect(recipeInDb).to.exist;
      expect(recipeInDb).to.include({
        name: newRecipe.name,
        prep_time: newRecipe.prep_time,
        total_time: newRecipe.total_time,
        recommendations: newRecipe.recommendations,
        origin: newRecipe.origin,
        visibility: newRecipe.visibility,
      });
    });

    it("should return 400 if name is missing", async function () {
      // Create the recipe without the name
      const res = await agent.post(recipeURL).send({
        prep_time: newRecipe.prep_time,
        total_time: newRecipe.total_time,
        ingredients: newRecipe.ingredients,
        steps: newRecipe.steps,
        recommendations: newRecipe.recommendations,
        origin: newRecipe.origin,
        visibility: newRecipe.visibility,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data, data missing");
    });

    it("should return 400 if data is not in JSON format", async function () {
      // Create the recipe with ingredients not in JSON format
      const res = await agent.post(recipeURL).send({
        name: newRecipe.name,
        prep_time: newRecipe.prep_time,
        total_time: newRecipe.total_time,
        ingredients: "provasfdas.{dgfsdj",
        steps: newRecipe.steps,
        recommendations: newRecipe.recommendations,
        origin: newRecipe.origin,
        visibility: newRecipe.visibility,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Invalid recipe data, not parsable");
    });

    it("should return 400 if time is not a number", async function () {
      // Create the recipe with prep_time and total_time not a number
      const res = await agent.post(recipeURL).send({
        name: newRecipe.name,
        prep_time: "sdfg",
        total_time: "sdf",
        ingredients: newRecipe.ingredients,
        steps: newRecipe.steps,
        recommendations: newRecipe.recommendations,
        origin: newRecipe.origin,
        visibility: newRecipe.visibility,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Invalid recipe data, not parsable");
    });

    it("should return 401 if the user is not authenticated", async function () {
      // Logout the user
      const res = await supertest(app).post(recipeURL).send(newRecipe);
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
    });
  });

  describe("Get recipe by ID: GET /api/recipes/:recipe_id", () => {
    before(async function () {
      await login(userFixtures[0]);
    });

    it("should return the recipe if the user is the author", async function () {
      // Get the recipe
      const recipeRes = await agent.get(recipeURL + recipeFixtures[0]._id);
      // Check if the response is successful
      expect(recipeRes.statusCode).to.equal(200);
      expect(recipeRes.body.recipe).to.deep.include({
        name: recipeFixtures[0].name,
        prep_time: recipeFixtures[0].prep_time,
        total_time: recipeFixtures[0].total_time,
        ingredients: recipeFixtures[0].ingredients,
        steps: recipeFixtures[0].steps,
        recommendations: recipeFixtures[0].recommendations,
        origin: recipeFixtures[0].origin,
        visibility: recipeFixtures[0].visibility,
      });
    });

    it("should return the recipe if the recipe is public", async function () {
      // Get a public recipe outside the user's family
      const recipeRes = await agent.get(recipeURL + recipeFixtures[3]._id);
      // Check if the response is successful
      expect(recipeRes.statusCode).to.equal(200);
    });

    it("should return the recipe if the user has common family", async function () {
      // Get a recipe from a family the user is part of
      const recipeRes = await agent.get(recipeURL + recipeFixtures[4]._id);
      // Check if the response is successful
      expect(recipeRes.statusCode).to.equal(200);
    });

    it("should return 401 if the user is not authenticated", async function () {
      // Get the recipe without authentication
      const recipeRes = await supertest(app).get(
        recipeURL + recipeFixtures[0]._id
      );
      // Check if the response is unsuccessful
      expect(recipeRes.statusCode).to.equal(401);
      expect(recipeRes.body.message).to.equal("Not authorized, no token");
    });

    it("should return 403 if the recipe is private to family and the user doesn't have common family", async function () {
      // Get a private recipe outside the user's family
      const recipeRes = await agent.get(recipeURL + recipeFixtures[2]._id);
      // Check if the response is unsuccessful
      expect(recipeRes.statusCode).to.equal(403);
      expect(recipeRes.body.message).to.equal("Not authorized for this recipe");
    });

    it("should return 403 if the recipe is private even if the user has common family", async function () {
      // Get a private recipe from a family the user is part of
      const recipeRes = await agent.get(recipeURL + recipeFixtures[1]._id);
      // Check if the response is unsuccessful
      expect(recipeRes.statusCode).to.equal(403);
      expect(recipeRes.body.message).to.equal(
        "Private recipe. Not authorized as recipe owner"
      );
    });

    it("should return 404 if the recipe does not exist", async function () {
      // Get a recipe that does not exist
      const recipeRes = await agent.get(recipeURL + "660f0cfe6e4cca00864e4c99");
      // Check if the response is unsuccessful
      expect(recipeRes.statusCode).to.equal(404);
      expect(recipeRes.body.message).to.equal("Recipe not found");
    });
  });

  describe("Edit recipe by ID: PUT /api/recipes/:recipe_id", () => {
    before(async function () {
      await login(userFixtures[0]);
    });
    afterEach(async function () {
      await refreshRecipes();
    });

    const updatedRecipe = {
      name: "Updated Recipe",
      prep_time: 15,
      total_time: 25,
      ingredients: JSON.stringify([
        "updated ingredient 1",
        "updated ingredient 2",
      ]),
      steps: JSON.stringify(["updated step 1", "updated step 2"]),
      recommendations: "updated recommendation",
      origin: "updated origin",
      visibility: "private",
    };

    it("should update the recipe", async function () {
      // Update the recipe
      const res = await agent
        .put(recipeURL + recipeFixtures[0]._id.toString())
        .send(updatedRecipe);
      // Check if the response is successful
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Recipe updated");
      expect(res.body.recipe).to.deep.include({
        name: updatedRecipe.name,
        prep_time: updatedRecipe.prep_time,
        total_time: updatedRecipe.total_time,
        ingredients: JSON.parse(updatedRecipe.ingredients),
        steps: JSON.parse(updatedRecipe.steps),
        recommendations: updatedRecipe.recommendations,
        origin: updatedRecipe.origin,
        visibility: updatedRecipe.visibility,
      });
      // Verify the recipe was updated in the database
      const updatedRecipeInDb = await Recipe.findOne({
        name: updatedRecipe.name,
      });
      expect(updatedRecipeInDb).to.exist;
      expect(updatedRecipeInDb).to.include({
        name: updatedRecipe.name,
        prep_time: updatedRecipe.prep_time,
        total_time: updatedRecipe.total_time,
        recommendations: updatedRecipe.recommendations,
        origin: updatedRecipe.origin,
        visibility: updatedRecipe.visibility,
      });
    });

    it("should return 401 if the user is not authenticated", async function () {
      // Update the recipe without authentication
      const res = await supertest(app)
        .put(recipeURL + recipeFixtures[0]._id)
        .send(updatedRecipe);
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Not authorized, no token");
    });

    it("should return 400 if the recipe ID is not valid", async () => {
      // Update the recipe with a non-castable recipe_id
      const res = await agent
        .put(recipeURL + "non-castable-id")
        .send(updatedRecipe);
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 404 if the recipe does not exist", async function () {
      // Update a recipe that does not exist
      const res = await agent
        .put(recipeURL + "660f0cfe6e4cca00864e4c99")
        .send(updatedRecipe);
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Recipe not found");
    });

    it("should return 401 if the user is not the recipe owner", async function () {
      // Update a recipe that the user is not the owner
      const res = await agent
        .put(recipeURL + recipeFixtures[1]._id)
        .send(updatedRecipe);
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Not authorized as recipe owner");
    });

    it("should return 400 if data is not in JSON format", async function () {
      // Update the recipe with ingredients not in JSON format
      const res = await agent.put(recipeURL + recipeFixtures[0]._id).send({
        name: updatedRecipe.name,
        prep_time: updatedRecipe.prep_time,
        total_time: updatedRecipe.total_time,
        ingredients: "provasfdas.{dgfsdj",
        steps: updatedRecipe.steps,
        recommendations: updatedRecipe.recommendations,
        origin: updatedRecipe.origin,
        visibility: updatedRecipe.visibility,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Invalid recipe data, not parsable");
    });
  });

  describe("Get public recipes: GET /api/recipes/public", () => {
    it("should return public recipes", async function () {
      // Get public recipes
      const res = await agent.get(recipeURL + "public");
      expect(res.statusCode).to.equal(200);
      expect(res.body.recipes).to.have.lengthOf(2);
      expect(res.body.recipes[0]).to.deep.include({
        name: recipeFixtures[3].name,
        prep_time: recipeFixtures[3].prep_time,
        total_time: recipeFixtures[3].total_time,
        ingredients: recipeFixtures[3].ingredients,
        steps: recipeFixtures[3].steps,
        recommendations: recipeFixtures[3].recommendations,
        origin: recipeFixtures[3].origin,
      });
    });
  });

  describe("Add recipe to favorites: PUT /api/recipes/:recipe_id/favorite", () => {
    before(async function () {
      await login(userFixtures[0]);
    });
    afterEach(async function () {
      await refreshUsers();
    });

    it("should add the recipe to the user favorites", async function () {
      // Add the recipe to favorites
      const res = await agent.put(
        recipeURL + recipeFixtures[4]._id + "/favorite"
      );
      // Check if the response is successful
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Recipe added to favorites");
      // Verify the recipe was added to the user favorites
      const userInDb = await User.findOne({ email: userFixtures[0].email });
      expect(userInDb.favorites).to.include(recipeFixtures[4]._id);
    });

    it("should return 404 if the recipe does not exist", async function () {
      // Add a non-existing recipe to favorites
      const res = await agent.put(
        recipeURL + "660f0cfe6e4cca00864e4c99/favorite"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Recipe not found");
    });

    it("should return 400 if the recipe ID is not valid", async () => {
      // Add a non-castable recipe_id to favorites
      const res = await agent.put(recipeURL + "non-castable-id/favorite");
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 400 if the recipe is already in favorites", async function () {
      // Add a recipe that is already in favorites
      const res = await agent.put(
        recipeURL + recipeFixtures[0]._id + "/favorite"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Recipe already in favorites");
    });

    it("should return 401 if the user is not authenticated", async function () {
      // Add a recipe to favorites without authentication
      const res = await supertest(app).put(
        recipeURL + recipeFixtures[4]._id + "/favorite"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("Remove recipe from favorites: DELETE /api/recipes/:recipe_id/favorite", () => {
    before(async function () {
      await login(userFixtures[0]);
    });
    afterEach(async function () {
      await refreshUsers();
    });

    it("should remove the recipe from the user favorites", async function () {
      // Recipe from favorites
      const res = await agent.delete(
        recipeURL + recipeFixtures[0]._id + "/favorite"
      );
      // Check if the response is successful
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Recipe removed from favorites");
      // Verify the recipe was removed from the user favorites
      const userInDb = await User.findOne({ email: userFixtures[0].email });
      expect(userInDb.favorites).to.not.include(recipeFixtures[0]._id);
    });

    it("should return 404 if the recipe does not exist", async function () {
      // Remove a non-existing recipe from favorites
      const res = await agent.delete(
        recipeURL + "660f0cfe6e4cca00864e4c99/favorite"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Recipe not found");
    });

    it("should return 400 if the recipe is not in favorites", async function () {
      // Remove a recipe that is not in favorites
      const res = await agent.delete(
        recipeURL + recipeFixtures[4]._id + "/favorite"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Recipe not in favorites");
    });

    it("should return 400 if the recipe ID is not valid", async () => {
      // Remove a non-castable recipe_id from favorites
      const res = await agent.delete(recipeURL + "non-castable-id/favorite");
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async function () {
      // Remove a recipe from favorites without authentication
      const res = await supertest(app).delete(
        recipeURL + recipeFixtures[0]._id + "/favorite"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("Delete recipe by ID: DELETE /api/recipes/:recipe_id", () => {
    before(async function () {
      await login(userFixtures[0]);
    });
    afterEach(async function () {
      await refreshRecipes();
    });

    it("should delete the recipe", async function () {
      // Delete the recipe
      const res = await agent.delete(recipeURL + recipeFixtures[0]._id);
      // Check if the response is successful
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Recipe deleted");
      // Verify the recipe was deleted from the database
      const recipeInDb = await Recipe.findById(
        recipeFixtures[0]._id.toString()
      );
      expect(recipeInDb).to.not.exist;
    });

    it("should return 404 if the recipe does not exist", async function () {
      // Delete a recipe that does not exist
      const res = await agent.delete(recipeURL + "660f0cfe6e4cca00864e4c99");
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Recipe not found");
    });

    it("should return 400 if the recipe ID is not valid", async () => {
      // Delete the recipe with a non-castable recipe_id
      const res = await agent.delete(recipeURL + "non-castable-id");
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not the recipe owner", async function () {
      // Delete a recipe that the user is not the owner
      const res = await agent.delete(recipeURL + recipeFixtures[1]._id);
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Not authorized as recipe owner");
    });

    it("should return 401 if the user is not authenticated", async function () {
      // Delete the recipe without authentication
      const res = await supertest(app).delete(
        recipeURL + recipeFixtures[0]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Not authorized, no token");
    });
  });
});
