# Monthly observation preparation

The homepage reads `data/observed-birds.json` on the server. It does not fetch
observations when a visitor opens the page.

Run `npm run prepare:observations` with Node 24 to refresh the file manually.
The period is the 12 complete calendar months before the current Oslo month.
For example, a run in October 2026 covers 2025-10-01 through 2026-09-30.

Preparation files live in `data-preparation/`:

- `prepare-observations.mjs` runs the preparation and saves the finished dataset.
- `lib/observation-api.mjs` downloads and caches API responses.
- `lib/observation-rules.mjs` handles dates, taxonomy and location selection.

`package.json` runs `data-preparation/prepare-observations.mjs` through
`npm run prepare:observations`. The monthly workflow uses that npm command.

The preparation script:

1. Loads Artsnavn taxonomy and Artskart's candidate taxon summary.
2. Reads all returned details in the newest complete month.
3. Checks dates and coordinates against the saved Norwegian land-and-sea polygons.
4. Keeps the latest usable dated observation per accepted species. Subspecies
   and synonyms resolve to the accepted species; unidentified bird groups do not
   count as additional species. `ExistsInNorway` does not restrict this list.
5. Reads earlier months only for species still missing a usable location.
6. Replaces the published JSON atomically after a complete successful run.

All public Artskart providers and all location-precision bands are included.
Missing observation details, invalid/missing coordinates, dates that cannot be
resolved to a day, and locations outside the scope are excluded. No 1 km
precision limit or Artsobservasjoner-only filter is applied. Only public returned
coordinates are used; concealed locations are not reconstructed.

When several observations share the latest date, the lexicographically smallest
observation ID is used, to make the choice reproducible. This does not establish
which sighting occurred last within that day. If the newest report has no usable
location, an older usable report can be selected.

The temporary `.cache/observations` folder lets an interrupted local preparation
resume. To deliberately fetch everything fresh, choose a new `OBSERVATION_RUN_ID`
when running the command. The monthly job below uses a unique ID per attempt.
A failed refresh leaves the last complete published snapshot available.

## Monthly automation

The approved workflow is installed at
`.github/workflows/refresh-observations.yml`. Once published on the default
branch, GitHub schedules the following job:

- Run on the first day of each month at 04:17 Europe/Oslo, or by manual dispatch.
- Fetch public APIs and build, then commit/push only the completed
  `data/observed-birds.json` file to the default branch.
- Let the connected Vercel Git integration deploy that commit. Where necessary,
  a `VERCEL_DEPLOY_HOOK` GitHub Actions secret can explicitly trigger deployment.
- Repository workflow permissions must allow the job to write its snapshot.
  The workflow must be pushed to the default branch to be scheduled.
  GitHub scheduling can be delayed; it is not an exact-time guarantee.

Installed `.github/workflows/refresh-observations.yml`:

```yaml
name: Refresh bird observations
on:
  schedule:
    - cron: "17 4 1 * *"
      timezone: "Europe/Oslo"
  workflow_dispatch:
permissions:
  contents: write
concurrency:
  group: refresh-observations
  cancel-in-progress: false
jobs:
  refresh:
    runs-on: ubuntu-latest
    timeout-minutes: 120
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run prepare:observations
        env:
          OBSERVATION_RUN_ID: ${{ github.run_id }}-${{ github.run_attempt }}
      - run: npm run build
      - name: Save the completed snapshot
        id: publish
        run: |
          git add data/observed-birds.json
          if git diff --cached --quiet; then
            echo "changed=false" >> "$GITHUB_OUTPUT"
          else
            git config user.name "github-actions[bot]"
            git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
            git commit -m "Refresh monthly bird observations"
            git push
            echo "changed=true" >> "$GITHUB_OUTPUT"
          fi
      - name: Trigger Vercel deployment when a deploy hook is configured
        if: steps.publish.outputs.changed == 'true'
        env:
          DEPLOY_HOOK: ${{ secrets.VERCEL_DEPLOY_HOOK }}
        run: |
          if [ -n "$DEPLOY_HOOK" ]; then
            curl --fail --silent --show-error --request POST "$DEPLOY_HOOK" --output /dev/null
          fi
```

References:
- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- https://vercel.com/docs/deploy-hooks
