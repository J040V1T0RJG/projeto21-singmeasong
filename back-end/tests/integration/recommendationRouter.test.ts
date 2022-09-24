import supertest from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/database";
import { recommendationFactory } from "../factories/recommendation";

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