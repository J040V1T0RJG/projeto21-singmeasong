import supertest from "supertest";
import app from "../../src/app";
import { recommendationFactory } from "../factories/recommendation";

describe("Test POST '/recommendations'", () => {
    it("Should return statusCode 201 if the recommendation is successfully registered", async () => {
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