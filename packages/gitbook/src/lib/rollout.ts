/**
 * We often need to progressive rollout new data fetching methods to avoid hitting our API too hard.
 */
export function isRollout({
    discriminator,
    percentageRollout,
}: {
    discriminator: string;
    percentageRollout: number;
}): boolean {
    if (process.env.NODE_ENV === 'development') {
        return true;
    }

    // compute a simple hash of the discriminator
    let hash = 0;
    for (let i = 0; i < discriminator.length; i++) {
        hash = (hash << 5) - hash + discriminator.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash % 100) < percentageRollout;
}
