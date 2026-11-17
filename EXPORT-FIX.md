# Browser-only fix for the saved-error build failure

Use this only if an older installed script still fails test 11 on the literal OPENAI_API_KEY text. This ZIP already includes the fix.

1. Open https://github.com/yplanche/endian-lab/blob/main/scripts/build-pages.mjs .
2. Click the pencil icon.
3. Replace this one line:

```js
const data={projects:state.projects,latestManuscript:structuredClone(state.latestManuscript),featuredProjects:state.featuredProjects};
```

with:

```js
const pick = (value, keys) => Object.fromEntries(
  keys.filter(key => value?.[key] !== undefined)
    .map(key => [key, structuredClone(value[key])])
);
const data = {
  projects: pick(state.projects, [
    'items', 'lastSuccess', 'lastAttempt', 'status', 'retrievalMode', 'source'
  ]),
  latestManuscript: pick(state.latestManuscript, [
    'item', 'lastSuccess', 'lastAttempt', 'status'
  ]),
  featuredProjects: pick(state.featuredProjects, [
    'items', 'archive', 'lastSuccess', 'lastAttempt', 'status'
  ])
};
```

4. Commit changes directly to main. The commit starts a build/deployment.
5. Add OPENAI_API_KEY as a repository Actions secret and OPENAI_MODEL as a repository Actions variable if missing. Never paste a key into source.
6. After a successful deployment, manually Run workflow on main to exercise the updater; read all three content statuses.

Do not remove or disable the failing test. Do not overwrite data/content.json with an older package snapshot.
