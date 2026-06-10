import type { RecentSearchQueryEntry } from './recent-queries';

export type RecommendedQuestionResult = {
    type: 'recommended-question';
    id: string;
    question: string;
    action: 'ask' | 'search';
};

export function createRecommendedQuestionResult(
    id: string,
    question: string,
    action: 'ask' | 'search' = 'ask'
): RecommendedQuestionResult {
    return {
        type: 'recommended-question',
        id,
        question,
        action,
    };
}

export function getEmptySearchResults(props: {
    withAI: boolean;
    recentQueries: RecentSearchQueryEntry[];
    recommendedQuestions: RecommendedQuestionResult[];
}): RecommendedQuestionResult[] {
    const { withAI, recentQueries, recommendedQuestions } = props;

    if (!withAI) {
        return [];
    }

    const seenQuestions = new Set<string>();
    const results: RecommendedQuestionResult[] = [];

    for (const recentQuery of recentQueries) {
        if (seenQuestions.has(recentQuery.query)) {
            continue;
        }

        seenQuestions.add(recentQuery.query);
        results.push(
            createRecommendedQuestionResult(
                `recent-query-${recentQuery.action}-${recentQuery.query}`,
                recentQuery.query,
                recentQuery.action
            )
        );
    }

    for (const question of recommendedQuestions) {
        if (seenQuestions.has(question.question)) {
            continue;
        }

        seenQuestions.add(question.question);
        results.push(question);
    }

    return results;
}
