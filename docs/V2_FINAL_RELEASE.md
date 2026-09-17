# V2 final release

## Local gate

Run from `public/`:

```bash
npm run check:full
```

The release is blocked if any unit, rules, accessibility, E2E, console, security or build check fails.

## GitHub controls

In repository settings, protect `main` and require the `Mol quality gate` check before merge. Disable direct pushes and require pull requests for production changes.

## Production monitoring

Use the restricted `/pages/admin.html` page to review client errors and active presence. For external alerting, connect Firebase/Cloud Monitoring or an approved error service without sending passwords, tokens or nutrition/health data.

## Release and rollback

Create the release tag only after the local gate and manual smoke test pass:

```bash
git tag -a v2.0.0 -m "Mol V2"
git push origin v2.0.0
```

Publish Hosting from the protected production workflow. Keep the previous Hosting release available and restore it from Firebase Hosting release history if a critical regression appears.
