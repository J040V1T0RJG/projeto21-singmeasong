import supertest from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/database";
import { recommendationFactory } from "../factories/recommendation";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Test POST '/recommendations'", () => {
    it("Should return statusCode 201, if the recommendation is successfully registered", async () => {
        const recommendation = recommendationFactory();

        const result = await supertest(app).post("/recommendations").send(recommendation);

        expect(result.status).toBe(201);
    });

    it("Should return statusCode 422, if recommendation is not processable", async () => {
        const recommendation = {
            name: 12,
            youtubeLink: "invalidLink"
        };

        const result = await supertest(app).post("/recommendations").send(recommendation);

        expect(result.status).toBe(422);
    });

    it("Should return statusCode 409, if recommendation already exists in db", async () => {
        const recommendation = recommendationFactory();

        await supertest(app).post("/recommendations").send(recommendation);
        const result = await supertest(app).post("/recommendations").send(recommendation);

        expect(result.status).toBe(409);
    });
});

describe("Test GET '/recommendations'", () => {
    it("Must return an array of objects", async () => {
        const recommendation = recommendationFactory();

        await supertest(app).post("/recommendations").send(recommendation);
        const result = await supertest(app).get("/recommendations").send();

        expect(result.body).toBeDefined();
        expect(result.body).toBeInstanceOf(Array);
        expect(result.body[0]).toBeInstanceOf(Object);
        expect(result.body.length).toBeGreaterThan(0);
    });
});
/*
describe("Test GET '/recommendations/random'", () => {

});

describe("Test GET '/recommendations/top/:amount'", () => {
    
});
*/

describe("Test GET '/recommendations/:id'", () => {
    it("It should return only a recommendation with the requested id", async () => {
        const recommendation = recommendationFactory();

        await supertest(app).post("/recommendations").send(recommendation);
        const recommendationByName = await recommendationRepository.findByName(recommendation.name);
        
        const result = await supertest(app).get(`/recommendations/${recommendationByName?.id}`).send();

        expect(result.body).toBeDefined();
        expect(result.body).toBeInstanceOf(Object);
        expect(result.body.id).toBe(recommendationByName?.id);
    });

    it("Should return statusCode 404, if id does not exist", async () => {
        const id = 9999999999;

        const result = await supertest(app).get(`/recommendations/${id}`).send();

        expect(result.status).toBe(404);
    });
});

