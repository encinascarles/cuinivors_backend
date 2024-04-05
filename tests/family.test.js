import supertest from "supertest";
import { expect } from "chai";
import app from "../backend/server.js";
import { refreshFamilies, refreshFixtures } from "./fixtures/loadFixtures.js";
import {
  userFixtures,
  recipeFixtures,
  familyFixtures,
} from "./fixtures/mockDataDB.js";
import Family from "../backend/models/familyModel.js";

// Define the URLs
const loginURL = "/api/users/auth/";
const familyURL = "/api/families/";

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

describe("Family API", () => {
  before(async () => {
    await refreshFixtures();
    agent = supertest.agent(app);
  });

  describe("Create new family: POST /api/families", () => {
    before(async function () {
      await login(userFixtures[0]);
    });
    afterEach(async () => {
      await refreshFamilies();
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
      expect(res.body.message).to.equal("Family created");
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
      const invalidData = {
        name: "",
        description: "",
      };
      const res = await agent.post(familyURL).send(invalidData);
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
      expect(res.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("Get family by ID: GET /api/families/:family_id", () => {
    before(async function () {
      await login(userFixtures[0]);
    });

    it("should return the family", async () => {
      // Get the family
      const familyRes = await agent.get(familyURL + familyFixtures[0]._id);
      // Check if the response is successful
      expect(familyRes.statusCode).to.equal(200);
      expect(familyRes.body.family).to.deep.include({
        _id: familyFixtures[0]._id.toString(),
        name: familyFixtures[0].name,
        description: familyFixtures[0].description,
        family_image: familyFixtures[0].family_image,
      });
    });

    it("should return 404 if the family does not exist", async () => {
      // Get a non-existent family
      const familyRes = await agent.get(familyURL + "660f0cfe6e4cca00864e4c99");
      // Check if the response is unsuccessful
      expect(familyRes.statusCode).to.equal(404);
      expect(familyRes.body.message).to.equal("Family not found");
    });

    it("should return 400 if the family ID is not valid", async () => {
      // Get a family with an invalid ID
      const familyRes = await agent.get(familyURL + "non-castable-id");
      // Check if the response is unsuccessful
      expect(familyRes.statusCode).to.equal(400);
      expect(familyRes.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      // Get the family without authentication
      const familyRes = await supertest(app).get(
        familyURL + familyFixtures[0]._id
      );
      // Check if the response is unsuccessful
      expect(familyRes.statusCode).to.equal(401);
      expect(familyRes.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("Modify family by ID: PUT /api/families/:family_id", () => {
    before(async () => {
      await login(userFixtures[0]);
    });
    afterEach(async () => {
      await refreshFamilies();
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
      // Check if the response is successful
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
      it("should return 400 if the family ID is not valid", async () => {
        // Update a family with an invalid ID
        const res = await agent.put(familyURL + "non-castable-id").send({
          name: "Updated Family",
          description: "This is an updated family",
        });
        // Check if the response is unsuccessful
        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal("Not valid id");
      });
      it("should return 401 if the user is not authenticated", async () => {
        // Update the family without authentication
        const res = await supertest(app)
          .put(familyURL + familyFixtures[0]._id)
          .send({
            name: "Updated Family",
            description: "This is an updated family",
          });
        // Check if the response is unsuccessful
        expect(res.statusCode).to.equal(401);
        expect(res.body.message).to.equal("Not authorized, no token");
      });
      it("should return 404 if the family does not exist", async () => {
        // Update a non-existent family
        const res = await agent
          .put(familyURL + "660f0cfe6e4cca00864e4c99")
          .send({
            name: "Updated Family",
            description: "This is an updated family",
          });
        // Check if the response is unsuccessful
        expect(res.statusCode).to.equal(404);
        expect(res.body.message).to.equal("Family not found");
      });
      it("should return 400 if no data is provided", async () => {
        // Update the family with no data
        const res = await agent.put(familyURL + familyFixtures[0]._id);
        // Check if the response is unsuccessful
        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal("Not valid data");
      });
    });

    it("should return 404 if the family does not exist", async () => {
      // Update a non-existent family
      const familyData = {
        name: "Updated Family",
        description: "This is an updated family",
      };
      const res = await agent
        .put(familyURL + "660f0cfe6e4cca00864e4c99")
        .send(familyData);
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Family not found");
    });

    it("should return 400 if the family ID is not valid", async () => {
      // Update a family with an invalid ID
      const familyData = {
        name: "Updated Family",
        description: "This is an updated family",
      };
      const res = await agent
        .put(familyURL + "non-castable-id")
        .send(familyData);
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      // Update the family without authentication
      const familyData = {
        name: "Updated Family",
        description: "This is an updated family",
      };
      const res = await supertest(app)
        .put(familyURL + familyFixtures[0]._id)
        .send(familyData);
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("List family members: GET /api/families/:family_id/members", () => {
    before(async () => {
      await login(userFixtures[0]);
    });

    it("should return the family members", async () => {
      // Get the family members
      const membersRes = await agent.get(
        familyURL + familyFixtures[0]._id + "/members"
      );
      // Check if the response is successful
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
      // Get the family members with an invalid ID
      const membersRes = await agent.get(familyURL + "non-castable-id/members");
      // Check if the response is unsuccessful
      expect(membersRes.statusCode).to.equal(400);
      expect(membersRes.body.message).to.equal("Not valid id");
    });

    it("should return 404 if the family does not exist", async () => {
      // Get the members of a non-existent family
      const membersRes = await agent.get(
        familyURL + "660f0cfe6e4cca00864e4c99/members"
      );
      // Check if the response is unsuccessful
      expect(membersRes.statusCode).to.equal(404);
      expect(membersRes.body.message).to.equal("Family not found");
    });

    it("should return 401 if the user is not authenticated", async () => {
      // Get the family members without authentication
      const membersRes = await supertest(app).get(
        familyURL + familyFixtures[0]._id + "/members"
      );
      // Check if the response is unsuccessful
      expect(membersRes.statusCode).to.equal(401);
      expect(membersRes.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("Remove member from family: DELETE /api/families/:family_id/members/:user_id", () => {
    before(async () => {
      await login(userFixtures[0]);
    });
    afterEach(async () => {
      await refreshFamilies();
    });

    it("should remove the member from the family", async () => {
      // Remove the member from the family
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/members/" + userFixtures[1]._id
      );
      // Check if the response is successful
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Member removed from family");
      // Verify the user was removed from the family
      const familyInDb = await Family.findById(familyFixtures[0]._id);
      expect(familyInDb.members).to.not.include(userFixtures[1]._id);
      expect(familyInDb.admins).to.not.include(userFixtures[1]._id);
    });

    it("should return 404 if the family does not exist", async () => {
      // Remove a member from a non-existent family
      const res = await agent.delete(
        familyURL + "660f0cfe6e4cca00864e4c99/members/" + userFixtures[1]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Family not found");
    });

    it("should return 400 if the user is trying to remove himself", async () => {
      // Remove the user from the family
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/members/" + userFixtures[0]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Cannot remove yourself");
    });

    it("should return 400 if the family ID is not valid", async () => {
      // Remove a member from a family with an invalid ID
      const res = await agent.delete(
        familyURL + "non-castable-id/members/" + userFixtures[1]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 400 if the user ID is not valid", async () => {
      // Remove a member with an invalid ID
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/members/non-castable-id"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      // Remove the member from the family without authentication
      const res = await supertest(app).delete(
        familyURL + familyFixtures[0]._id + "/members/" + userFixtures[1]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("List family recipes: GET /api/families/:family_id/recipes", () => {
    before(async () => {
      await login(userFixtures[0]);
    });

    it("should return the family recipes (not the private ones)", async () => {
      // Get the family recipes
      const recipesRes = await agent.get(
        familyURL + familyFixtures[0]._id + "/recipes"
      );
      // Check if the response is successful
      expect(recipesRes.statusCode).to.equal(200);
      expect(recipesRes.body.recipes).to.have.lengthOf(2); //2 excludes the private recipes
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
      // Get the recipes of a non-existent family
      const recipesRes = await agent.get(
        familyURL + "660f0cfe6e4cca00864e4c99/recipes"
      );
      // Check if the response is unsuccessful
      expect(recipesRes.statusCode).to.equal(404);
      expect(recipesRes.body.message).to.equal("Family not found");
    });

    it("should return 400 if the family ID is not valid", async () => {
      // Get the recipes of a family with an invalid ID
      const recipesRes = await agent.get(familyURL + "non-castable-id/recipes");
      // Check if the response is unsuccessful
      expect(recipesRes.statusCode).to.equal(400);
      expect(recipesRes.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      // Get the family recipes without authentication
      const recipesRes = await supertest(app).get(
        familyURL + familyFixtures[0]._id + "/recipes"
      );
      // Check if the response is unsuccessful
      expect(recipesRes.statusCode).to.equal(401);
    });
  });

  describe("List all families recipes: GET /api/families/recipes", () => {
    before(async () => {
      await login(userFixtures[0]);
    });

    it("should return all user families recipes (not the private ones)", async () => {
      // Get all user families recipes
      const recipesRes = await agent.get(familyURL + "recipes");
      // Check if the response is successful
      expect(recipesRes.statusCode).to.equal(200);
      expect(recipesRes.body.recipes).to.have.lengthOf(3); //3 excludes the private recipes
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
      // Get all user families recipes without authentication
      const recipesRes = await supertest(app).get(familyURL + "recipes");
      // Check if the response is unsuccessful
      expect(recipesRes.statusCode).to.equal(401);
      expect(recipesRes.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("Leave family: DELETE /api/families/:family_id/leave", () => {
    before(async () => {
      await login(userFixtures[0]);
    });
    afterEach(async () => {
      await refreshFamilies();
    });

    it("should leave the family", async () => {
      // Leave the family
      const res = await agent.delete(
        familyURL + familyFixtures[1]._id + "/leave"
      );
      // Check if the response is successful
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Left family");
      // Verify the user left the family
      const familyInDb = await Family.findById(familyFixtures[1]._id);
      expect(familyInDb.members).to.not.include(userFixtures[0]._id);
    });

    it("should return 400 if the user is the last admin", async () => {
      // Leave the family as last admin
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/leave"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Cannot leave as last admin");
    });

    it("should return 404 if the family does not exist", async () => {
      // Leave a non-existent family
      const res = await agent.delete(
        familyURL + "660f0cfe6e4cca00864e4c99/leave"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Family not found");
    });

    it("should return 400 if the family ID is not valid", async () => {
      // Leave a family with an invalid ID
      const res = await agent.delete(familyURL + "non-castable-id/leave");
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      // Leave the family without authentication
      const res = await supertest(app).delete(
        familyURL + familyFixtures[0]._id + "/leave"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("Add admin to family: POST /api/families/:family_id/admins/:user_id", () => {
    before(async () => {
      await login(userFixtures[0]);
    });
    afterEach(async () => {
      await refreshFamilies();
    });

    it("should add an admin to the family", async () => {
      // Add an admin to the family
      const res = await agent.post(
        familyURL + familyFixtures[0]._id + "/admins/" + userFixtures[1]._id
      );
      // Check if the response is successful
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Admin added");
      // Verify the user was added as an admin to the family
      const familyInDb = await Family.findById(familyFixtures[0]._id);
      expect(familyInDb.admins).to.include(userFixtures[1]._id);
    });

    it("should return 400 if the user is already an admin", async () => {
      // Add an admin that is already an admin
      const res = await agent.post(
        familyURL + familyFixtures[0]._id + "/admins/" + userFixtures[0]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("User is already an admin");
    });

    it("should return 404 if the family does not exist", async () => {
      // Add an admin to a non-existent family
      const res = await agent.post(
        familyURL + "660f0cfe6e4cca00864e4c99/admins/" + userFixtures[1]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Family not found");
    });

    it("should return 404 if the user does not exist", async () => {
      // Add a non-existent user as an admin
      const res = await agent.post(
        familyURL + familyFixtures[0]._id + "/admins/660f0cfe6e4cca00864e4c99"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("User not found");
    });

    it("should return 400 if the user is not a member of the family", async () => {
      // Add a user that is not a member of the family as an admin
      const res = await agent.post(
        familyURL + familyFixtures[0]._id + "/admins/" + userFixtures[3]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("User is not a member of the family");
    });

    it("should return 400 if the family ID is not valid", async () => {
      // Add an admin to a family with an invalid ID
      const res = await agent.post(
        familyURL + "non-castable-id/admins/" + userFixtures[1]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 400 if the user ID is not valid", async () => {
      // Add an admin with an invalid ID
      const res = await agent.post(
        familyURL + familyFixtures[0]._id + "/admins/non-castable-id"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      // Add an admin to the family without authentication
      const res = await supertest(app).post(
        familyURL + familyFixtures[0]._id + "/admins/" + userFixtures[1]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
    });
  });

  describe("Remove admin from family: DELETE /api/families/:family_id/admins/:user_id", () => {
    before(async () => {
      await login(userFixtures[0]);
    });
    afterEach(async () => {
      await refreshFamilies();
    });

    it("should remove an admin from the family", async () => {
      // Remove an admin from the family
      const res = await agent.delete(
        familyURL + familyFixtures[3]._id + "/admins/" + userFixtures[3]._id
      );
      // Check if the response is successful
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Admin removed");
      // Verify the user was removed as an admin from the family
      const familyInDb = await Family.findById(familyFixtures[3]._id);
      expect(familyInDb.admins).to.not.include(userFixtures[3]._id);
    });

    it("should return 403 if the user isn't an admin", async () => {
      // Remove an admin from the family as a non-admin
      const res = await agent.delete(
        familyURL + familyFixtures[1]._id + "/admins/" + userFixtures[1]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(403);
      expect(res.body.message).to.equal("Not authorized as an admin");
    });

    it("should return 400 if the user is the last admin", async () => {
      // Remove the last admin from the family
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/admins/" + userFixtures[0]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Cannot remove last admin");
    });

    it("should return 404 if the family does not exist", async () => {
      // Remove an admin from a non-existent family
      const res = await agent.delete(
        familyURL + "660f0cfe6e4cca00864e4c99/admins/" + userFixtures[1]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Family not found");
    });

    it("should return 404 if the user does not exist", async () => {
      // Remove a non-existent user as an admin
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/admins/660f0cfe6e4cca00864e4c99"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("User not found");
    });

    it("should return 400 if the family ID is not valid", async () => {
      // Remove an admin from a family with an invalid ID
      const res = await agent.delete(
        familyURL + "non-castable-id/admins/" + userFixtures[1]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 400 if the user ID is not valid", async () => {
      // Remove an admin with an invalid ID
      const res = await agent.delete(
        familyURL + familyFixtures[0]._id + "/admins/non-castable-id"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      // Remove an admin from the family without authentication
      const res = await supertest(app).delete(
        familyURL + familyFixtures[0]._id + "/admins/" + userFixtures[1]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("Delete family: DELETE /api/families/:family_id", () => {
    before(async () => {
      await login(userFixtures[0]);
    });
    afterEach(async () => {
      await refreshFamilies();
    });

    it("should delete the family", async () => {
      // Delete the family
      const res = await agent.delete(familyURL + familyFixtures[0]._id);
      // Check if the response is successful
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Family deleted");
      // Verify the family was deleted
      const familyInDb = await Family.findById(familyFixtures[0]._id);
      expect(familyInDb).to.not.exist;
    });

    it("should return 404 if the family does not exist", async () => {
      // Delete a non-existent family
      const res = await agent.delete(familyURL + "660f0cfe6e4cca00864e4c99");
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Family not found");
    });

    it("should return 400 if the family ID is not valid", async () => {
      // Delete a family with an invalid ID
      const res = await agent.delete(familyURL + "non-castable-id");
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid id");
    });

    it("should return 401 if the user is not authenticated", async () => {
      // Delete the family without authentication
      const res = await supertest(app).delete(
        familyURL + familyFixtures[0]._id
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Not authorized, no token");
    });

    it("should return 403 if the user isn't an admin", async () => {
      // Delete the family as a non-admin
      const res = await agent.delete(familyURL + familyFixtures[1]._id);
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(403);
      expect(res.body.message).to.equal("Not authorized as an admin");
    });
  });
});
