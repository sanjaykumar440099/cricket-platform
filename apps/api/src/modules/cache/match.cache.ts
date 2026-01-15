import { redis } from './redis.client';
import { CacheKeys } from './cache.keys';

export async function setMatchState(matchId: string, state: any) {
    await redis.set(CacheKeys.matchState(matchId), JSON.stringify(state), 'EX', 60 * 60 * 24);
}

export async function getMatchState(matchId: string) {
    const data = await redis.get(CacheKeys.matchState(matchId));
    return data ? JSON.parse(data) : null;
}

export async function incrementSpectators(matchId: string) {
    await redis.incr(CacheKeys.matchSpectators(matchId));
}

export async function decrementSpectators(matchId: string) {
    await redis.decr(CacheKeys.matchSpectators(matchId));
}

export async function bindSocketToMatch(socketId: string, matchId: string) {
    await redis.set(CacheKeys.socketMatch(socketId), matchId, 'EX', 120);
}

export async function bindUserToMatchSocket(userId: string, matchId: string, socketId: string) {
    await redis.set(CacheKeys.userMatchSocket(userId, matchId), socketId, 'EX', 120);
}

export async function getUserMatchSocket(userId: string, matchId: string) {
    return redis.get(CacheKeys.userMatchSocket(userId, matchId));
}

export async function cleanupMatch(matchId: string) {
    await redis.del(
        CacheKeys.matchState(matchId),
        CacheKeys.matchScore(matchId),
        CacheKeys.matchSpectators(matchId),
        CacheKeys.matchSnapshot(matchId)
    );

    await redis.srem(CacheKeys.liveMatches(), matchId);
}