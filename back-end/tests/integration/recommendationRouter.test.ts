import supertest from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/database";
import { recommendationFactory, recommendationWithScoreFactory } from "../factories/recommendation";
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

describe("Test GET '/recommendations/random'", () => {
    it("Must return an objects", async () => {
        const recommendations = [];

        for(let i = 0; i < 10; i++) {
            const recommendation = recommendationWithScoreFactory();
            recommendations.push(recommendation);
        };

        await prisma.recommendation.createMany({data: recommendations});

        const result = await supertest(app).get("/recommendations/random").send();

        expect(result.body).toBeDefined();
        expect(result.body).toBeInstanceOf(Object);
    });

    it("Should return statusCode 404, if id does not exist", async () => {
        const result = await supertest(app).get("/recommendations/random").send();

        expect(result.status).toBe(404);
    });
});

describe("Test GET '/recommendations/top/:amount'", () => {
    it("Must return an array of object, of the size that was passed", async () => {
        const recommendations = [];
        const amount = 10;

        for(let i = 0; i < 100; i++) {
            const recommendation = recommendationWithScoreFactory();
            recommendations.push(recommendation);
        };

        await prisma.recommendation.createMany({data: recommendations});

        const result = await supertest(app).get(`/recommendations/top/${amount}`).send();

        expect(result.body.length).toBe(amount);
        expect(result.body).toBeInstanceOf(Array);
    });
});


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

describe("Test POST /recommendations/:id/upvote", () =>{
    it("Should return statusCode 200, if recommendation successfully liked", async () => {
        const recommendation = recommendationFactory();

        await supertest(app).post("/recommendations").send(recommendation);
        const recommendationByName = await recommendationRepository.findByName(recommendation.name);

        const result = await supertest(app).post(`/recommendations/${recommendationByName?.id}/upvote`).send();

        expect(result.status).toBe(200);
    });

    it("Should return statusCode 404, if id does not exist", async () => {
        const id = 9999999999;

        const result = await supertest(app).post(`/recommendations/${id}/upvote`).send();

        expect(result.status).toBe(404);
    });
});

describe("Test POST /recommendations/:id/downvote", () =>{
    it("Should return statusCode 200, if recommendation successfully liked", async () => {
        const recommendation = recommendationFactory();

        await supertest(app).post("/recommendations").send(recommendation);
        const recommendationByName = await recommendationRepository.findByName(recommendation.name);

        const result = await supertest(app).post(`/recommendations/${recommendationByName?.id}/downvote`).send();

        expect(result.status).toBe(200);
    });

    it("Should return statusCode 404, if id does not exist", async () => {
        const id = 9999999999;

        const result = await supertest(app).post(`/recommendations/${id}/downvote`).send();

        expect(result.status).toBe(404);
    });

    it("Must return statusCode 200 and empty result.body, if recommendation score is less than -5", async () => {
        const recommendation = recommendationFactory();

        await prisma.recommendation.create({
            data: {
                ...recommendation,
                score: -6
            }
        });

        const recommendationByName = await recommendationRepository.findByName(recommendation.name);
        const result = await supertest(app).post(`/recommendations/${recommendationByName?.id}/downvote`).send();

        const countData = Object.keys(result.body).length;

        expect(result.status).toBe(200);
        expect(countData).toBe(0);
    });
});

