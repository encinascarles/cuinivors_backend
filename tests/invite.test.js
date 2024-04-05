import supertest from "supertest";
import { expect } from "chai";
import app from "../backend/server.js";
import { refreshInvites, refreshFixtures } from "./fixtures/loadFixtures.js";
import {
  userFixtures,
  familyFixtures,
  inviteFixtures,
} from "./fixtures/mockDataDB.js";
import Invite from "../backend/models/inviteModel.js";
import Family from "../backend/models/familyModel.js";

// Define the URLs
const loginURL = "/api/users/auth/";
const inviteURL = "/api/invites/";

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

describe("Invite API", () => {
  before(async () => {
    await refreshFixtures();
    agent = supertest.agent(app);
  });

  describe("Create invite: POST /api/invites", () => {
    before(async function () {
      await login(userFixtures[0]);
    });
    after(async function () {
      await refreshInvites();
    });

    it("should create a new invite and verify it was added to the database", async function () {
      // Create the invite
      const res = await agent.post(inviteURL).send({
        family_id: familyFixtures[0]._id,
        invited_username: userFixtures[3].username,
      });
      // Check if the response is successful
      expect(res.statusCode).to.equal(201);
      expect(res.body.message).to.equal("Invite created");
      expect(res.body.invite).to.deep.include({
        family_id: familyFixtures[0]._id.toString(),
        invited_user_id: userFixtures[3]._id.toString(),
        inviter_user_id: userFixtures[0]._id.toString(),
      });
      // Verify the invite was added to the database
      const inviteInDb = await Invite.findOne({
        family_id: familyFixtures[0]._id,
        invited_user_id: userFixtures[3]._id,
        inviter_user_id: userFixtures[0]._id,
      });
      expect(inviteInDb).to.exist;
    });

    it("should return 400 if data is missing", async function () {
      // Create the invite without the family_id
      const res = await agent
        .post(inviteURL)
        .send({ family_id: familyFixtures[0]._id });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });

    it("should return 404 if user does not exist", async function () {
      // Create the invite with a non-existing user
      const res = await agent.post(inviteURL).send({
        family_id: familyFixtures[0]._id,
        invited_username: "userinvented",
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("User not found");
    });

    it("should return 404 if family does not exist", async function () {
      // Create the invite with a non-existing family
      const res = await agent.post(inviteURL).send({
        family_id: "660f0cfe6e4cca00864e4c99",
        invited_username: userFixtures[2].username,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Family not found");
    });

    it("should return 400 if user is already in family", async function () {
      // Create the invite with a user that is already in the family
      const res = await agent.post(inviteURL).send({
        family_id: familyFixtures[0]._id,
        invited_username: userFixtures[1].username,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("User is already in family");
    });

    it("should return 400 if user has already been invited", async function () {
      // Create the invite with a user that has already been invited
      const res = await agent.post(inviteURL).send({
        family_id: familyFixtures[0]._id,
        invited_username: userFixtures[2].username,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("User has already been invited");
    });

    it("should return 403 if the inviter user is not in the family", async function () {
      // Create the invite with a user that is not in the family
      const res = await agent.post(inviteURL).send({
        family_id: familyFixtures[2]._id,
        invited_username: userFixtures[3].username,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(403);
      expect(res.body.message).to.equal("Not authorized");
    });

    it("should return 400 if the id is not valid", async function () {
      // Create the invite with a non-castable family_id
      const res = await agent.post(inviteURL).send({
        family_id: "123456",
        invited_username: userFixtures[2].username,
      });
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });
  });

  describe("List invites: GET /api/invites", () => {
    before(async function () {
      await login(userFixtures[2]);
    });

    it("should return the list of invites", async function () {
      // Get the list of invites
      const invitesRes = await agent.get(inviteURL);
      // Check if the response is successful
      expect(invitesRes.statusCode).to.equal(200);
      expect(invitesRes.body.invites).to.have.lengthOf(1);
      expect(invitesRes.body.invites[0]).to.deep.include({
        family_id: familyFixtures[0]._id.toString(),
        invited_user_id: userFixtures[2]._id.toString(),
        inviter_user_id: userFixtures[0]._id.toString(),
      });
    });

    it("should return 401 if the user is not authenticated", async function () {
      // Get the list of invites without authentication
      const invitesRes = await supertest(app).get(inviteURL);
      // Check if the response is unsuccessful
      expect(invitesRes.statusCode).to.equal(401);
      expect(invitesRes.body.message).to.equal("Not authorized, no token");
    });
  });

  describe("Accept invite: POST /api/invites/:invite_id/accept", () => {
    before(async function () {
      await login(userFixtures[2]);
    });
    afterEach(async function () {
      await refreshInvites();
    });

    it("should accept the invite and verify the user was added to the family", async function () {
      // Accept the invite
      const res = await agent.post(
        inviteURL + inviteFixtures[0]._id + "/accept"
      );
      // Check if the response is successful
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Invite accepted");
      // Verify the user was added to the family
      const familyInDb = await Family.findById(familyFixtures[0]._id);
      expect(familyInDb.members).to.include(userFixtures[2]._id);
    });

    it("should return 404 if the invite does not exist", async function () {
      // Accept a non-existing invite
      const res = await agent.post(
        inviteURL + "660f0cfe6e4cca00864e4c99/accept"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Invite not found");
    });

    it("should return 400 if the id is not valid", async function () {
      // Accept the invite with a non-castable id
      const res = await agent.post(inviteURL + "non-castable-id/accept");
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });

    it("should return 401 if the user is not the invited user", async function () {
      // Accept the invite with a user that is not the invited user
      const res = await agent.post(
        inviteURL + inviteFixtures[1]._id + "/accept"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Not authorized");
    });
  });

  describe("Decline invite: POST /api/invites/:invite_id/decline", () => {
    before(async function () {
      await login(userFixtures[2]);
    });
    afterEach(async function () {
      await refreshInvites();
    });

    it("should decline the invite", async function () {
      // Decline the invite
      const res = await agent.post(
        inviteURL + inviteFixtures[0]._id + "/decline"
      );
      // Check if the response is successful
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal("Invite declined");
      // Verify the invite was removed from the database
      const inviteInDb = await Invite.findById(inviteFixtures[0]._id);
      expect(inviteInDb).to.not.exist;
    });

    it("should return 404 if the invite does not exist", async function () {
      // Decline a non-existing invite
      const res = await agent.post(
        inviteURL + "660f0cfe6e4cca00864e4c99/decline"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Invite not found");
    });

    it("should return 400 if the id is not valid", async function () {
      // Decline the invite with a non-castable id
      const res = await agent.post(inviteURL + "non-castable-id/decline");
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Not valid data");
    });

    it("should return 401 if the user is not the invited user", async function () {
      // Decline the invite with a user that is not the invited user
      const res = await agent.post(
        inviteURL + inviteFixtures[1]._id + "/decline"
      );
      // Check if the response is unsuccessful
      expect(res.statusCode).to.equal(401);
      expect(res.body.message).to.equal("Not authorized");
    });
  });
});
