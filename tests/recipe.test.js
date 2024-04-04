import supertest from "supertest";
import { expect } from "chai";
import app from "../backend/server.js";
import User from "../backend/models/userModel.js";
import Recipe from "../backend/models/recipeModel.js";
import {
  loadUsers,
  loadFamilies,
  loadRecipes,
  loadFixtures,
  clearUsers,
  clearFamilies,
  clearRecipes,
} from "./fixtures/loadFixtures.js";
import { userFixtures, recipeFixtures } from "./fixtures/mockDataDB.js";

const loginURL = "/api/users/auth/";

const recipeURL = "/api/recipes/";

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

describe("Recipe API", () => {
  //to test with postman
  // after(async function () {
  //   await loadFixtures();
  // });
  describe("Add new recipe: POST /api/recipes", () => {
    beforeEach(async function () {
      await loadUsers();
      await login(agent, userFixtures[0]);
    });
    afterEach(async function () {
      await clearUsers();
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
      expect(res.statusCode).to.equal(201);

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
      const res = await agent.post(recipeURL).send({
        prep_time: newRecipe.prep_time,
        total_time: newRecipe.total_time,
        ingredients: newRecipe.ingredients,
        steps: newRecipe.steps,
        recommendations: newRecipe.recommendations,
        origin: newRecipe.origin,
        visibility: newRecipe.visibility,
      });
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data, data missing");
    });
    it("should return 400 if data is not in JSON format", async function () {
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
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Invalid recipe data, not parsable");
    });
    it("should return 400 if time is not a number", async function () {
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
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Invalid recipe data, not parsable");
    });
    it("should return 401 if the user is not authenticated", async function () {
      const res = await supertest(app).post(recipeURL).send(newRecipe);
      expect(res.statusCode).to.equal(401);
    });
  });
  describe("Get recipe by ID: GET /api/recipes/:recipe_id", () => {
    beforeEach(async function () {
      await loadUsers();
      await loadRecipes();
      await login(agent, userFixtures[0]);
    });
    afterEach(async function () {
      await clearUsers();
      await clearRecipes();
    });

    it("should return the recipe", async function () {
      // Get the recipe
      const recipeRes = await agent.get(recipeURL + recipeFixtures[0]._id);
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
    it("should return 401 if the user is not authenticated", async function () {
      const recipeRes = await supertest(app).get(
        recipeURL + recipeFixtures[0]._id
      );
      expect(recipeRes.statusCode).to.equal(401);
    });
    it("should return 404 if the recipe does not exist", async function () {
      const recipeRes = await agent.get(recipeURL + "123456");
      expect(recipeRes.statusCode).to.equal(404);
    });
  });

  describe("Edit recipe by ID: PUT /api/recipes/:recipe_id", () => {
    beforeEach(async function () {
      await loadUsers();
      await loadRecipes();
      await login(agent, userFixtures[0]);
    });
    afterEach(async function () {
      await clearUsers();
      await clearRecipes();
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
      const res = await supertest(app)
        .put(recipeURL + recipeFixtures[0]._id)
        .send(updatedRecipe);
      expect(res.statusCode).to.equal(401);
    });
    it("should return 404 if the recipe does not exist", async function () {
      const res = await agent.put(recipeURL + "123456").send(updatedRecipe);
      expect(res.statusCode).to.equal(404);
    });
    it("should return 401 if the user is not the recipe owner", async function () {
      const res = await agent
        .put(recipeURL + recipeFixtures[1]._id)
        .send(updatedRecipe);
      expect(res.statusCode).to.equal(401);
    });
    it("should return 400 if data is not in JSON format", async function () {
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
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Invalid recipe data, not parsable");
    });
  });

  describe("Get public recipes: GET /api/recipes/public", () => {
    beforeEach(async function () {
      await loadRecipes();
    });
    afterEach(async function () {
      await clearRecipes();
    });

    it("should return public recipes", async function () {
      // Get public recipes
      const res = await agent.get(recipeURL + "public");
      expect(res.statusCode).to.equal(200);
      expect(res.body.recipes).to.have.lengthOf(1);
      expect(res.body.recipes[0]).to.deep.include({
        name: recipeFixtures[3].name,
        prep_time: recipeFixtures[3].prep_time,
        total_time: recipeFixtures[3].total_time,
        ingredients: recipeFixtures[3].ingredients,
        steps: recipeFixtures[3].steps,
        recommendations: recipeFixtures[3].recommendations,
        origin: recipeFixtures[3].origin,
        visibility: recipeFixtures[3].visibility,
      });
    });
  });

  describe("Add recipe to favorites: PUT /api/recipes/:recipe_id/favorite", () => {
    beforeEach(async function () {
      await loadUsers();
      await loadRecipes();
      await loadFamilies();
      await login(agent, userFixtures[0]);
    });
    afterEach(async function () {
      await clearUsers();
      await clearRecipes();
      await clearFamilies();
    });

    it("should add the recipe to the user favorites", async function () {
      // Add the recipe to favorites
      const res = await agent.put(
        recipeURL + recipeFixtures[1]._id + "/favorite"
      );
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Recipe added to favorites");
      // Verify the recipe was added to the user favorites
      const userInDb = await User.findOne({ email: userFixtures[0].email });
      expect(userInDb.favorites).to.include(recipeFixtures[1]._id);
    });
    it("should return 404 if the recipe does not exist", async function () {
      const res = await agent.put(recipeURL + "123456/favorite");
      expect(res.statusCode).to.equal(404);
    });
    it("should return 400 if the recipe is already in favorites", async function () {
      // Try to add a recipe that is already in favorites
      const res = await agent.put(
        recipeURL + recipeFixtures[0]._id + "/favorite"
      );
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Recipe already in favorites");
    });
    it("should return 401 if the user is not authenticated", async function () {
      const res = await supertest(app).put(
        recipeURL + recipeFixtures[1]._id + "/favorite"
      );
      expect(res.statusCode).to.equal(401);
    });
  });

  describe("Remove recipe from favorites: DELETE /api/recipes/:recipe_id/favorite", () => {
    beforeEach(async function () {
      await loadUsers();
      await loadRecipes();
      await loadFamilies();
      await login(agent, userFixtures[0]);
    });
    afterEach(async function () {
      await clearUsers();
      await clearRecipes();
      await clearFamilies();
    });

    it("should remove the recipe from the user favorites", async function () {
      // Remove the recipe from favorites
      const res = await agent.delete(
        recipeURL + recipeFixtures[0]._id + "/favorite"
      );
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Recipe removed from favorites");
      // Verify the recipe was removed from the user favorites
      const userInDb = await User.findOne({ email: userFixtures[0].email });
      expect(userInDb.favorites).to.not.include(recipeFixtures[0]._id);
    });
    it("should return 404 if the recipe does not exist", async function () {
      const res = await agent.delete(recipeURL + "123456/favorite");
      expect(res.statusCode).to.equal(404);
    });
    it("should return 400 if the recipe is not in favorites", async function () {
      // Try to remove a recipe that is not in favorites
      const res = await agent.delete(
        recipeURL + recipeFixtures[1]._id + "/favorite"
      );
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Recipe not in favorites");
    });
    it("should return 401 if the user is not authenticated", async function () {
      const res = await supertest(app).delete(
        recipeURL + recipeFixtures[0]._id + "/favorite"
      );
      expect(res.statusCode).to.equal(401);
    });
  });

  describe("Delete recipe by ID: DELETE /api/recipes/:recipe_id", () => {
    beforeEach(async function () {
      await loadUsers();
      await loadRecipes();
      await login(agent, userFixtures[0]);
    });
    afterEach(async function () {
      await clearUsers();
      await clearRecipes();
    });

    it("should delete the recipe", async function () {
      // Delete the recipe
      const res = await agent.delete(recipeURL + recipeFixtures[0]._id);
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Recipe deleted");
      // Verify the recipe was deleted from the database
      const recipeInDb = await Recipe.findById(
        recipeFixtures[0]._id.toString()
      );
      console.log(recipeInDb);
      expect(recipeInDb).to.not.exist;
    });
    it("should return 404 if the recipe does not exist", async function () {
      const res = await agent.delete(recipeURL + "123456");
      expect(res.statusCode).to.equal(404);
    });
    it("should return 401 if the user is not the recipe owner", async function () {
      const res = await agent.delete(recipeURL + recipeFixtures[1]._id);
      expect(res.statusCode).to.equal(401);
    });
    it("should return 401 if the user is not authenticated", async function () {
      const res = await supertest(app).delete(
        recipeURL + recipeFixtures[0]._id
      );
      expect(res.statusCode).to.equal(401);
    });
  });
});
