import supertest from "supertest";
import { expect } from "chai";
import app from "../backend/server.js";
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
  recipeFixtures,
  familyFixtures,
} from "./fixtures/mockDataDB.js";
import Family from "../backend/models/familyModel.js";

const loginURL = "/api/users/auth/";

const familyURL = "/api/families/";

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

describe("Family API", () => {
  //to test with postman
  // after(async function () {
  //   await loadFixtures();
  // });

  describe("Create new family: POST /api/families", () => {
    beforeEach(async () => {
      await clearFamilies();
      await clearUsers();
      await loadFamilies();
      await loadUsers();
      await login(agent, userFixtures[0]);
    });

    it("should create a family with valid data", async () => {
      // Create a family
      const familyData = {
        name: "Test Family",
        description: "This is a test family",
      };
      const res = await agent.post(familyURL).send(familyData);
      // Check if the response is successful
      expect(res.statusCode).to.equal(201);
      expect(res.body.family).to.have.property("_id");
      expect(res.body.family.name).to.equal(familyData.name);
      expect(res.body.family.description).to.equal(familyData.description);
      // Verify the family was added to the database
      const familyInDb = await Family.findOne({ name: familyData.name });
      expect(familyInDb).to.exist;
      expect(familyInDb).to.include({
        name: familyData.name,
        description: familyData.description,
      });
    });

    it("should not create a family with invalid data", async () => {
      // Create a family with invalid data
      const familyData = {
        name: "",
        description: "",
      };
      const res = await agent.post(familyURL).send(familyData);
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });

    it("should not create a family if the user is not authenticated", async () => {
      // Create a family
      const familyData = {
        name: "Test Family",
        description: "This is a test family",
      };
      const res = await supertest(app).post(familyURL).send(familyData);
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
    });
  });
  describe("Get family by ID: GET /api/families/:family_id", () => {
    beforeEach(async () => {
      await clearFamilies();
      await clearUsers();
      await loadFamilies();
      await loadUsers();
      await login(agent, userFixtures[0]);
    });

    it("should return the family", async () => {
      // Get the family
      const familyRes = await agent.get(familyURL + familyFixtures[0]._id);
      expect(familyRes.statusCode).to.equal(200);
      expect(familyRes.body.family).to.deep.include({
        _id: familyFixtures[0]._id.toString(),
        name: familyFixtures[0].name,
        description: familyFixtures[0].description,
        family_image: familyFixtures[0].family_image,
      });
    });

    it("should return 404 if the family does not exist", async () => {
      const familyRes = await agent.get(familyURL + "660f0cfe6e4cca00864e4c99");
      expect(familyRes.statusCode).to.equal(404);
    });

    it("should return 400 if the family ID is not valid", async () => {
      const familyRes = await agent.get(familyURL + "non-castable-id");
      expect(familyRes.statusCode).to.equal(400);
      expect(familyRes.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      const familyRes = await supertest(app).get(
        familyURL + familyFixtures[0]._id
      );
      expect(familyRes.statusCode).to.equal(401);
    });
  });
  describe("Modify family by ID: PUT /api/families/:family_id", () => {
    beforeEach(async () => {
      await clearFamilies();
      await clearUsers();
      await loadFamilies();
      await loadUsers();
      await login(agent, userFixtures[0]);
    });

    it("should update the family", async () => {
      // Update the family
      const familyData = {
        name: "Updated Family",
        description: "This is an updated family",
      };
      const res = await agent
        .put(familyURL + familyFixtures[0]._id)
        .send(familyData);
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Family updated");
      expect(res.body.family).to.deep.include({
        name: familyData.name,
        description: familyData.description,
      });
      // Verify the family was updated in the database
      const updatedFamilyInDb = await Family.findOne({
        name: familyData.name,
      });
      expect(updatedFamilyInDb).to.exist;
      expect(updatedFamilyInDb).to.include({
        name: familyData.name,
        description: familyData.description,
      });
    });

    it("should return 404 if the family does not exist", async () => {
      const familyData = {
        name: "Updated Family",
        description: "This is an updated family",
      };
      const res = await agent
        .put(familyURL + "660f0cfe6e4cca00864e4c99")
        .send(familyData);
      expect(res.statusCode).to.equal(404);
    });

    it("should return 400 if the family ID is not valid", async () => {
      const familyData = {
        name: "Updated Family",
        description: "This is an updated family",
      };
      const res = await agent
        .put(familyURL + "non-castable-id")
        .send(familyData);
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      const familyData = {
        name: "Updated Family",
        description: "This is an updated family",
      };
      const res = await supertest(app)
        .put(familyURL + familyFixtures[0]._id)
        .send(familyData);
      expect(res.statusCode).to.equal(401);
    });
  });
  describe("List family members: GET /api/families/:family_id/members", () => {
    beforeEach(async () => {
      await clearFamilies();
      await clearUsers();
      await loadFamilies();
      await loadUsers();
      await login(agent, userFixtures[0]);
    });

    it("should return the family members", async () => {
      // Get the family members
      const membersRes = await agent.get(
        familyURL + familyFixtures[0]._id + "/members"
      );
      expect(membersRes.statusCode).to.equal(200);
      expect(membersRes.body.members).to.have.lengthOf(2);
      expect(membersRes.body.members[0]).to.deep.include({
        _id: userFixtures[0]._id.toString(),
        name: userFixtures[0].name,
        username: userFixtures[0].username,
        email: userFixtures[0].email,
        profile_image: userFixtures[0].profile_image,
      });
    });

    it("should return 400 if the family ID is not valid", async () => {
      const membersRes = await agent.get(familyURL + "non-castable-id/members");
      expect(membersRes.statusCode).to.equal(400);
      expect(membersRes.body.message).to.equal("Not valid id");
    });

    it("should return 404 if the family does not exist", async () => {
      const membersRes = await agent.get(
        familyURL + "660f0cfe6e4cca00864e4c99/members"
      );
      expect(membersRes.statusCode).to.equal(404);
    });

    it("should return 401 if the user is not authenticated", async () => {
      const membersRes = await supertest(app).get(
        familyURL + familyFixtures[0]._id + "/members"
      );
      expect(membersRes.statusCode).to.equal(401);
    });
  });
  describe("Remove member from family: DELETE /api/families/:family_id/members/:user_id", () => {
    beforeEach(async () => {
      await clearFamilies();
      await clearUsers();
      await loadFamilies();
      await loadUsers();
      await login(agent, userFixtures[0]);
    });

    it("should remove the member from the family", async () => {
      // Remove the member from the family
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/members/" + userFixtures[1]._id
      );
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Member removed from family");
      // Verify the member was removed from the family
      const familyInDb = await Family.findById(familyFixtures[0]._id);
      expect(familyInDb.members).to.not.include(userFixtures[1]._id);
      expect(familyInDb.admins).to.not.include(userFixtures[1]._id);
    });

    it("should return 404 if the family does not exist", async () => {
      const res = await agent.delete(
        familyURL + "660f0cfe6e4cca00864e4c99/members/" + userFixtures[1]._id
      );
      expect(res.statusCode).to.equal(404);
    });

    it("should return 400 if the user is trying to remove himself", async () => {
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/members/" + userFixtures[0]._id
      );
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Cannot remove yourself");
    });

    it("should return 400 if the family ID is not valid", async () => {
      const res = await agent.delete(
        familyURL + "non-castable-id/members/" + userFixtures[1]._id
      );
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 400 if the user ID is not valid", async () => {
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/members/non-castable-id"
      );
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      const res = await supertest(app).delete(
        familyURL + familyFixtures[0]._id + "/members/" + userFixtures[1]._id
      );
      expect(res.statusCode).to.equal(401);
    });
  });
  describe("List family recipes: GET /api/families/:family_id/recipes", () => {
    beforeEach(async () => {
      await clearFamilies();
      await clearUsers();
      await clearRecipes();
      await loadFamilies();
      await loadUsers();
      await loadRecipes();
      await login(agent, userFixtures[0]);
    });

    it("should return the family recipes", async () => {
      // Get the family recipes
      const recipesRes = await agent.get(
        familyURL + familyFixtures[0]._id + "/recipes"
      );
      expect(recipesRes.statusCode).to.equal(200);
      expect(recipesRes.body.recipes).to.have.lengthOf(3);
      expect(recipesRes.body.recipes[0]).to.deep.include({
        _id: recipeFixtures[0]._id.toString(),
        name: recipeFixtures[0].name,
        prep_time: recipeFixtures[0].prep_time,
        total_time: recipeFixtures[0].total_time,
        ingredients: recipeFixtures[0].ingredients,
        steps: recipeFixtures[0].steps,
        recommendations: recipeFixtures[0].recommendations,
        origin: recipeFixtures[0].origin,
      });
    });

    it("should return 404 if the family does not exist", async () => {
      const recipesRes = await agent.get(
        familyURL + "660f0cfe6e4cca00864e4c99/recipes"
      );
      expect(recipesRes.statusCode).to.equal(404);
    });

    it("should return 400 if the family ID is not valid", async () => {
      const recipesRes = await agent.get(familyURL + "non-castable-id/recipes");
      expect(recipesRes.statusCode).to.equal(400);
      expect(recipesRes.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      const recipesRes = await supertest(app).get(
        familyURL + familyFixtures[0]._id + "/recipes"
      );
      expect(recipesRes.statusCode).to.equal(401);
    });
  });
  describe("List all families recipes: GET /api/families/recipes", () => {
    beforeEach(async () => {
      await clearFamilies();
      await clearUsers();
      await clearRecipes();
      await loadFamilies();
      await loadUsers();
      await loadRecipes();
      await login(agent, userFixtures[0]);
    });

    it("should return all user families recipes", async () => {
      // Get all user families recipes
      const recipesRes = await agent.get(familyURL + "recipes");
      expect(recipesRes.statusCode).to.equal(200);
      expect(recipesRes.body.recipes).to.have.lengthOf(4);
      expect(recipesRes.body.recipes[0]).to.deep.include({
        _id: recipeFixtures[0]._id.toString(),
        name: recipeFixtures[0].name,
        prep_time: recipeFixtures[0].prep_time,
        total_time: recipeFixtures[0].total_time,
        ingredients: recipeFixtures[0].ingredients,
        steps: recipeFixtures[0].steps,
        recommendations: recipeFixtures[0].recommendations,
        origin: recipeFixtures[0].origin,
      });
    });

    it("should return 401 if the user is not authenticated", async () => {
      const recipesRes = await supertest(app).get(familyURL + "recipes");
      expect(recipesRes.statusCode).to.equal(401);
    });
  });
  describe("Leave family: DELETE /api/families/:family_id/leave", () => {
    beforeEach(async () => {
      await clearFamilies();
      await clearUsers();
      await loadFamilies();
      await loadUsers();
      await login(agent, userFixtures[0]);
    });

    it("should leave the family", async () => {
      // Leave the family
      const res = await agent.delete(
        familyURL + familyFixtures[1]._id + "/leave"
      );
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Left family");
      // Verify the user left the family
      const familyInDb = await Family.findById(familyFixtures[1]._id);
      expect(familyInDb.members).to.not.include(userFixtures[0]._id);
    });

    it("should return 400 if the user is the last admin", async () => {
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/leave"
      );
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Cannot leave as last admin");
    });

    it("should return 404 if the family does not exist", async () => {
      const res = await agent.delete(
        familyURL + "660f0cfe6e4cca00864e4c99/leave"
      );
      expect(res.statusCode).to.equal(404);
    });

    it("should return 400 if the family ID is not valid", async () => {
      const res = await agent.delete(familyURL + "non-castable-id/leave");
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      const res = await supertest(app).delete(
        familyURL + familyFixtures[0]._id + "/leave"
      );
      expect(res.statusCode).to.equal(401);
    });
  });
  describe("Add admin to family: POST /api/families/:family_id/admins/:user_id", () => {
    beforeEach(async () => {
      await clearFamilies();
      await clearUsers();
      await loadFamilies();
      await loadUsers();
      await login(agent, userFixtures[0]);
    });

    it("should add an admin to the family", async () => {
      // Add an admin to the family
      const res = await agent.post(
        familyURL + familyFixtures[0]._id + "/admins/" + userFixtures[1]._id
      );
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Admin added");
      // Verify the user was added as an admin to the family
      const familyInDb = await Family.findById(familyFixtures[0]._id);
      expect(familyInDb.admins).to.include(userFixtures[1]._id);
    });

    it("should return 400 if the user is already an admin", async () => {
      const res = await agent.post(
        familyURL + familyFixtures[0]._id + "/admins/" + userFixtures[0]._id
      );
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("User is already an admin");
    });

    it("should return 404 if the family does not exist", async () => {
      const res = await agent.post(
        familyURL + "660f0cfe6e4cca00864e4c99/admins/" + userFixtures[1]._id
      );
      expect(res.statusCode).to.equal(404);
    });

    it("should return 404 if the user does not exist", async () => {
      const res = await agent.post(
        familyURL + familyFixtures[0]._id + "/admins/660f0cfe6e4cca00864e4c99"
      );
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("User not found");
    });

    it("should return 400 if the user is not a member of the family", async () => {
      const res = await agent.post(
        familyURL + familyFixtures[0]._id + "/admins/" + userFixtures[3]._id
      );
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("User is not a member of the family");
    });

    it("should return 400 if the family ID is not valid", async () => {
      const res = await agent.post(
        familyURL + "non-castable-id/admins/" + userFixtures[1]._id
      );
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 400 if the user ID is not valid", async () => {
      const res = await agent.post(
        familyURL + familyFixtures[0]._id + "/admins/non-castable-id"
      );
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      const res = await supertest(app).post(
        familyURL + familyFixtures[0]._id + "/admins/" + userFixtures[1]._id
      );
      expect(res.statusCode).to.equal(401);
    });
  });

  describe("Remove admin from family: DELETE /api/families/:family_id/admins/:user_id", () => {
    beforeEach(async () => {
      await clearFamilies();
      await clearUsers();
      await loadFamilies();
      await loadUsers();
      await login(agent, userFixtures[0]);
    });

    it("should remove an admin from the family", async () => {
      // Remove an admin from the family
      const res = await agent.delete(
        familyURL + familyFixtures[3]._id + "/admins/" + userFixtures[3]._id
      );
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Admin removed");
      // Verify the user was removed as an admin from the family
      const familyInDb = await Family.findById(familyFixtures[3]._id);
      expect(familyInDb.admins).to.not.include(userFixtures[3]._id);
    });

    it("should return 403 if the user isn't an admin", async () => {
      const res = await agent.delete(
        familyURL + familyFixtures[1]._id + "/admins/" + userFixtures[1]._id
      );
      expect(res.statusCode).to.equal(403);
      expect(res.body.message).to.equal("Not authorized as an admin");
    });

    it("should return 400 if the user is the last admin", async () => {
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/admins/" + userFixtures[0]._id
      );
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Cannot remove last admin");
    });

    it("should return 404 if the family does not exist", async () => {
      const res = await agent.delete(
        familyURL + "660f0cfe6e4cca00864e4c99/admins/" + userFixtures[1]._id
      );
      expect(res.statusCode).to.equal(404);
    });

    it("should return 404 if the user does not exist", async () => {
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/admins/660f0cfe6e4cca00864e4c99"
      );
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("User not found");
    });

    it("should return 400 if the family ID is not valid", async () => {
      const res = await agent.delete(
        familyURL + "non-castable-id/admins/" + userFixtures[1]._id
      );
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 400 if the user ID is not valid", async () => {
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/admins/non-castable-id"
      );
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      const res = await supertest(app).delete(
        familyURL + familyFixtures[0]._id + "/admins/" + userFixtures[1]._id
      );
      expect(res.statusCode).to.equal(401);
    });
  });

  describe("Delete family: DELETE /api/families/:family_id", () => {
    beforeEach(async () => {
      await clearFamilies();
      await clearUsers();
      await loadFamilies();
      await loadUsers();
      await login(agent, userFixtures[0]);
    });

    it("should delete the family", async () => {
      // Delete the family
      const res = await agent.delete(familyURL + familyFixtures[0]._id);
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Family deleted");
      // Verify the family was deleted
      const familyInDb = await Family.findById(familyFixtures[0]._id);
      expect(familyInDb).to.not.exist;
    });

    it("should return 404 if the family does not exist", async () => {
      const res = await agent.delete(familyURL + "660f0cfe6e4cca00864e4c99");
      expect(res.statusCode).to.equal(404);
    });

    it("should return 400 if the family ID is not valid", async () => {
      const res = await agent.delete(familyURL + "non-castable-id");
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      const res = await supertest(app).delete(
        familyURL + familyFixtures[0]._id
      );
      expect(res.statusCode).to.equal(401);
    });

    it("should return 403 if the user isn't an admin", async () => {
      const res = await agent.delete(familyURL + familyFixtures[1]._id);
      expect(res.statusCode).to.equal(403);
      expect(res.body.message).to.equal("Not authorized as an admin");
    });
  });
});
