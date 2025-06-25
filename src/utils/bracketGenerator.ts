// src/utils/bracketGenerator.ts
import { Match, Tournament } from '../interfaces';

export const generateDoubleEliminationBracket = (tournament: Tournament): Match[] => {
    const matches: Match[] = [];
    const { participants } = tournament;
    const participantCount = participants.length;

    if (participantCount < 2) {
        return matches;
    }

    // Шаг 1: Создаем сетку победителей
    const winnersRounds = Math.ceil(Math.log2(participantCount));
    let winnersMatches: Match[] = [];

    // Генерация матчей верхней сетки
    for (let round = 0; round < winnersRounds; round++) {
        const matchesInRound = Math.ceil(participantCount / Math.pow(2, round + 1));
        for (let match = 0; match < matchesInRound; match++) {
            winnersMatches.push({
                id: `w-${round}-${match}`,
                round: round + 1,
                bracket: 'winners',
                team1Id: null,
                team2Id: null,
                score1: null,
                score2: null,
                winnerId: null
            });
        }
    }

    // Шаг 2: Создаем сетку проигравших
    const losersRounds = winnersRounds * 2 - 1;
    let losersMatches: Match[] = [];

    for (let round = 0; round < losersRounds; round++) {
        let matchesInRound = 0;

        if (round === 0) {
            matchesInRound = Math.pow(2, winnersRounds - 2);
        } else if (round % 2 === 1) {
            matchesInRound = Math.pow(2, winnersRounds - 1 - Math.ceil(round / 2));
        } else {
            matchesInRound = Math.pow(2, winnersRounds - 1 - Math.floor(round / 2));
        }

        for (let match = 0; match < matchesInRound; match++) {
            losersMatches.push({
                id: `l-${round}-${match}`,
                round: round + 1,
                bracket: 'losers',
                team1Id: null,
                team2Id: null,
                score1: null,
                score2: null,
                winnerId: null
            });
        }
    }

    // Шаг 3: Создаем финальные матчи
    const finalMatches: Match[] = [
        {
            id: 'final-1',
            round: 1,
            bracket: 'final',
            team1Id: null,
            team2Id: null,
            score1: null,
            score2: null,
            winnerId: null
        },
        {
            id: 'final-2',
            round: 2,
            bracket: 'final',
            team1Id: null,
            team2Id: null,
            score1: null,
            score2: null,
            winnerId: null
        }
    ];

    // Шаг 4: Определяем начальные встречи для первого раунда
    // Здесь просто распределяем участников по первым матчам
    const firstRoundMatches = winnersMatches.filter(m => m.round === 1);
    for (let i = 0; i < firstRoundMatches.length; i++) {
        const match = firstRoundMatches[i];
        const team1Index = i * 2;
        const team2Index = i * 2 + 1;

        if (team1Index < participantCount) {
            match.team1Id = participants[team1Index].id;
        }

        if (team2Index < participantCount) {
            match.team2Id = participants[team2Index].id;
        }
    }

    return [...winnersMatches, ...losersMatches, ...finalMatches];
};
