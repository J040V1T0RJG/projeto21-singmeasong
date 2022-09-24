import { faker } from "@faker-js/faker";
import { CreateRecommendationData } from "../../src/services/recommendationsService";

const recommendationFactory = (): CreateRecommendationData => {
    return {
        name: faker.lorem.words(),
        youtubeLink: `https://www.youtube.com/${faker.internet.domainWord()}`
    };
};

export {
    recommendationFactory
};