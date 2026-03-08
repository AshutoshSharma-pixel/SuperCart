// Test subscription status logic 

const getStatus = (store) => {
    let status = 'NO_PLAN';
    const now = new Date();

    if (store.planExpiresAt) {
        const tempExpiresAt = new Date(store.planExpiresAt);
        const tempGraceEndsAt = store.gracePeriodEndsAt ? new Date(store.gracePeriodEndsAt) : null;

        if (store.isLocked || (tempGraceEndsAt && now > tempGraceEndsAt)) {
            status = 'LOCKED';
        } else if (now > tempExpiresAt) {
            status = 'GRACE_PERIOD';
        } else {
            status = 'ACTIVE';
        }
    }
    return status;
}

describe('Subscription status logic', () => {
    const now = new Date();
    const future = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const past = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const gracePast = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

    test('NO_PLAN when planExpiresAt is null', () => {
        const store = { planExpiresAt: null, gracePeriodEndsAt: null, isLocked: false };
        expect(getStatus(store)).toBe('NO_PLAN');
    });

    test('ACTIVE when planExpiresAt is in future', () => {
        const store = { planExpiresAt: future, gracePeriodEndsAt: new Date(future.getTime() + 2 * 86400000), isLocked: false };
        expect(getStatus(store)).toBe('ACTIVE');
    });

    test('GRACE_PERIOD when past planExpiresAt but before gracePeriodEndsAt', () => {
        const store = { planExpiresAt: past, gracePeriodEndsAt: future, isLocked: false };
        expect(getStatus(store)).toBe('GRACE_PERIOD');
    });

    test('LOCKED when past gracePeriodEndsAt', () => {
        const store = { planExpiresAt: past, gracePeriodEndsAt: gracePast, isLocked: true };
        expect(getStatus(store)).toBe('LOCKED');
    });
});
