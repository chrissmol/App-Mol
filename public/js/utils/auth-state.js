export function subscribeAfterAuthReady(ready, subscribe, callback) {
  let active = true;
  let unsubscribe = () => {};
  void Promise.resolve(ready).then(() => {
    if (!active) return;
    unsubscribe = subscribe(callback);
  });
  return () => {
    active = false;
    unsubscribe();
  };
}