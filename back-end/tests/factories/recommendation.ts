import { faker } from "@faker-js/faker";
import { CreateRecommendationData } from "../../src/services/recommendationsService";

const recommendationFactory = (): CreateRecommendationData => {
    return {
        name: faker.lorem.words(),
        youtubeLink: `https://www.youtube.com/${faker.internet.domainWord()}`
    };
};

const recommendationWithScoreFactory = (): {name: string, youtubeLink: string, score: number} => {
    return {
        name: faker.lorem.words(),
        youtubeLink: `https://www.youtube.com/${faker.internet.domainWord()}`,
        score: Math.floor(Math.random() * 1000) + 1
    };
};

export {
    recommendationFactory,
    recommendationWithScoreFactory
};