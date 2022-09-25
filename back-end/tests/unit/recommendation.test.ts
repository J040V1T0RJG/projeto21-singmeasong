import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { CreateRecommendationData, recommendationService } from "../../src/services/recommendationsService";
import { recommendationFactory } from "../factories/recommendation";

beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
})

describe("Recommendation Services unit tests", () => {
    it("Must create a recommendation", async () => {
        const recommendation = recommendationFactory();

        jest
            .spyOn(recommendationRepository, "findByName")
            .mockImplementationOnce((): any => {});

        jest
            .spyOn(recommendationRepository, "create")
            .mockImplementationOnce((): any => {});

        await recommendationService.insert(recommendation);

        expect(recommendationRepository.create).toBeCalled();
    });

    it("Must not create a duplicate recommendation", async () => {
        const recommendation = recommendationFactory();

        jest
            .spyOn(recommendationRepository, "findByName")
            .mockImplementationOnce((): any => {
                return { ...recommendation};
            });

        const promise = recommendationService.insert(recommendation);

        expect(promise).rejects.toEqual({
            type: "conflict",
            message: "Recommendations names must be unique"
        });
        expect(recommendationRepository.create).not.toBeCalled();
    });
});