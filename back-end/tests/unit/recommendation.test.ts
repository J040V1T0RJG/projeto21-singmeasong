import { Recommendation } from "@prisma/client";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { CreateRecommendationData, recommendationService } from "../../src/services/recommendationsService";
import { recommendationFactory, recommendationWithScoreFactory } from "../factories/recommendation";
import { conflictError, notFoundError } from "../../src/utils/errorUtils";

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

        expect(promise).rejects.toEqual(conflictError("Recommendations names must be unique"));
        expect(recommendationRepository.create).not.toBeCalled();
    });

    it("Deve retornar uma recomendação aleatoria", async () => {
        jest
            .spyOn(recommendationRepository, "findAll")
            .mockImplementationOnce((): any => {
                const recommendations = [];

                for(let i = 0; i < 10; i++) {
                    const recommendation = recommendationWithScoreFactory();
                    recommendations.push(recommendation);
                };

                return recommendations;
            });

        const result = await recommendationService.getRandom();
    
        expect(result).toBeInstanceOf(Object);
    });

    it("should increment score if id exists", async () => {
        const recommendation = {id: 1, ...recommendationFactory()};
        const id: number = recommendation.id;
    
        jest
          .spyOn(recommendationRepository, "find")
          .mockImplementationOnce((): any => {
            return recommendation;
          });

        jest
          .spyOn(recommendationRepository, "updateScore")
          .mockImplementationOnce((): any => {
            return recommendation;
          });
    
        await recommendationService.upvote(id);

        expect(recommendationRepository.find).toBeCalled();
        expect(recommendationRepository.updateScore).toBeCalled();
      });

      it("should not increment score if id doesn't existis", async () => {
        const recommendation = {id: 1, ...recommendationFactory()};
        const id: number = recommendation.id;
    
        jest
            .spyOn(recommendationRepository, "find")
            .mockImplementationOnce((): any => {return null});

        jest
            .spyOn(recommendationRepository, "updateScore");
    
        const promise = recommendationService.upvote(id);

        expect(promise).rejects.toEqual(notFoundError());
        expect(recommendationRepository.find).toBeCalled();
        expect(recommendationRepository.updateScore).not.toBeCalled();
      });

      it("should decrement score if id exists", async () => {
        const recommendation = {id: 1, ...recommendationFactory()};
        const id: number = recommendation.id;
    
        jest
          .spyOn(recommendationRepository, "find")
          .mockImplementationOnce((): any => {
            return recommendation;
          });

        jest
          .spyOn(recommendationRepository, "updateScore")
          .mockImplementationOnce((): any => {
            return recommendation;
          });
    
        await recommendationService.downvote(id);

        expect(recommendationRepository.find).toBeCalled();
        expect(recommendationRepository.updateScore).toBeCalled();
      });
});
