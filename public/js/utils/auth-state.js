const DEFAULT_TRANSIENT_NULL_GRACE_MS = 1200;

export function subscribeAfterAuthReady(
  ready,
  subscribe,
  callback,
  { transientNullGraceMs = DEFAULT_TRANSIENT_NULL_GRACE_MS } = {}
) {
  let active = true;
  let nullTimer = 0;
  let lastUserId;

  function deliver(user) {
    if (!active) return;
    const userId = user?.uid || null;
    if (userId === lastUserId) return;
    lastUserId = userId;
    callback(user);
  }

  function handleState(user) {
    clearTimeout(nullTimer);
    if (!user && lastUserId) {
      nullTimer = setTimeout(() => deliver(null), transientNullGraceMs);
      return;
    }
    deliver(user);
  }

  const unsubscribe = subscribe(handleState);

  Promise.resolve(ready).catch(error => {
    console.warn('[Mol] Estado inicial da autenticacao demorou demais:', error?.message || error);
  });

  return () => {
    active = false;
    clearTimeout(nullTimer);
    unsubscribe();
  };
}
