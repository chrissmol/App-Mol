const DEFAULT_TRANSIENT_NULL_GRACE_MS = 1200;

export function subscribeAfterAuthReady(
  ready,
  subscribe,
  callback,
  { transientNullGraceMs = DEFAULT_TRANSIENT_NULL_GRACE_MS } = {}
) {
  let active = true;
  let unsubscribe = () => {};
  let nullTimer = 0;
  let lastUserId;

  const deliver = user => {
    if (!active) return;
    const userId = user?.uid || null;
    if (userId === lastUserId) return;
    lastUserId = userId;
    callback(user);
  };

  const handleState = user => {
    clearTimeout(nullTimer);
    if (!user && lastUserId) {
      nullTimer = setTimeout(() => deliver(null), transientNullGraceMs);
      return;
    }
    deliver(user);
  };

  void Promise.resolve(ready).then(() => {
    if (!active) return;
    unsubscribe = subscribe(handleState);
  });
  return () => {
    active = false;
    clearTimeout(nullTimer);
    unsubscribe();
  };
}
