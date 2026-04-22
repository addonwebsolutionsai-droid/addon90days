# /ship-release

Validates, builds, and publishes a new toolkit release to npm.

## Usage
```
/ship-release patch    # bug fixes
/ship-release minor    # new skills
/ship-release major    # breaking changes
```

## Steps
1. Run `pnpm typecheck` — must pass
2. Run `pnpm test` — must pass
3. Run `pnpm build`
4. Bump version in package.json
5. Update CHANGELOG.md
6. Commit: `chore: release v<version>`
7. Tag: `git tag v<version>`
8. `npm publish --access public`
9. Push to GitHub
10. Post release notes to Discord/Twitter

## Do NOT ship if
- Any TypeScript error exists
- Any test fails
- CHANGELOG.md not updated
- Founder hasn't approved if breaking change
