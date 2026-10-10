# Mol V2 release checklist

## Automated gate

- [ ] GitHub Actions `Mol quality gate` is green.
- [ ] Unit/integration tests, lint, HTML validation and production build pass.
- [ ] Firestore rules pass against the local emulator.
- [ ] Axe accessibility checks pass in light and dark themes.
- [ ] E2E passes on desktop, Android, iPhone and tablet.
- [ ] Console health reports no app errors or warnings.
- [ ] Network checks report no failed requests or unexpected Firebase errors.
- [ ] `npm run audit` (blocks on production dependencies; build-only findings are warnings) and the local security scan pass.

## Manual smoke test

- [ ] Login and logout work; unauthenticated users cannot access private data.
- [ ] Profile loads, edits persist, and the private monitoring shortcut remains restricted.
- [ ] Diet loads the correct account data, opens a meal directly, and separates view from edit.
- [ ] Workout opens, records a normal series and contextual method, and can be cancelled safely.
- [ ] Rest timer remains usable beside the exercise, works in both themes, and pause/skip/adjust work.
- [ ] Offline mode persists after reload and queued changes recover when the connection returns.
- [ ] Desktop widths 1280, 1440 and 1920 have no clipping, overlap or horizontal scroll.
- [ ] Mobile widths 320, 390 and 412 have no header overlap, clipped text or blocked controls.
- [ ] Visual styles Classic, Gamer neon and Caveira remain readable in light and dark mode.

## Rollout and rollback

1. Deploy only Hosting from the protected `production` environment.
2. Run the smoke test against the deployed URL before announcing V2.
3. Keep the previous Firebase Hosting release available as the rollback target.
4. If a critical regression appears, restore the previous Hosting release immediately and open a follow-up issue.
5. Review `/pages/admin.html` for client errors and presence after launch, without exposing user data publicly.

Firebase Hosting releases are immutable. Rollback must be performed from the Firebase Console's Hosting release history or with the Firebase CLI release/version command, after verifying the exact previous release.
