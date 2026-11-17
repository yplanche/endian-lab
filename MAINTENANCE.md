# Content updates and maintenance

Reviewed with the packaged source on **17 November 2026**.

## What runs where

GitHub Actions executes the updater in Node.js, commits changed `data/` files, rebuilds and deploys `site/` in the same run. GitHub Pages serves static files only: no database, Cloudflare Worker or public write endpoint is required. The GitHub schedule is daily at 07:17 UTC; **Run workflow** performs the same update immediately. Ordinary pushes publish edits without calling the content services.

The original private hosted website is separate. Its ChatGPT task runs at 07:00 Europe/London using updaterInstructions revision 5. Installing this package does not migrate, stop or connect that task to GitHub. Use the supplied Actions workflow for GitHub updates. If you later retire the original website, pause its task separately.

Schedules may be delayed; public-repository schedules can be disabled after 60 days without activity. Review Actions and the website's freshness notices regularly.

## Automatic content

### Latest manuscript

The public ORCID works API at https://pub.orcid.org/v3.0/0000-0002-3624-0757/works supplies dated DOI-bearing works. The updater selects the newest journal article by publication date, excluding preprints, corrections and retraction notices. Keep your ORCID works publicly visible; authorised Crossref/publisher updates can help keep ORCID current, but the website does not manage those permissions.

On a new DOI, the updater retrieves a matching abstract from Crossref or Europe PMC/PubMed, then requests an original 50–100-word summary using only that abstract. Future issue dates require an already-published online date. Source or model failures preserve the previous feature. Review generated text periodically; not every publisher exposes an accessible abstract.

Paper figures are not copied automatically. A hand-verified real figure can be added with source, caption, author credit and reuse licence. Otherwise the feature remains text-only. Do not fabricate an illustration and present it as a paper figure.

### Featured projects

Every newly listed eligible ORCID DOI is checked, even if Latest manuscript has not changed. The baseline of existing works was saved on 17 November 2026; the eight editorial features are the starting point rather than a bulk import of past publications.

The updater analyses primary abstract content and assigns one main theme: Earth observation/environmental AI (`remote`), oceans/climate/coasts (`ocean`), environmental biogeochemistry/chemical measurements (`chemistry`), or resource flows/industrial ecology (`resource`). It writes a factual original 30–100-word description and records the theme rationale, confidence and evidence URLs. Confidence below 0.75 or missing evidence requires review and leaves previous features intact. Failed candidates are retried.

Only two entries per theme remain active, ranked by verified online date when available, otherwise publication date. Undated editorial projects retire first. Older additions go to the archive if two newer entries already occupy the theme. DOI deduplication and atomic state writes prevent duplicate features. Retired entries remain on `archive.html`; no archive entries are deleted by normal updates. A run analyses up to ten pending papers, with excess candidates left for subsequent runs.

### PhD opportunities

Imperial's official project listing remains the source. The GitHub updater retrieves it directly and validates exact project titles and supervisor strings naming Plancherel. It asks the configured model to extract changed excerpts; unchanged excerpts skip the model call. Missing entries remain pending availability confirmation. If direct access is blocked, GitHub retains prior projects and flags the check. Unlike the hosted ChatGPT task, this GitHub package has no web-search fallback.

### Editorial and external content

Theme introductions, people/recruitment/consultancy/support text, scholarships and media are maintained manually. The Imperial portrait uses its live thumbnail endpoint with a daily browser cache refresh; Imperial caching or endpoint changes can affect it. Flightdesk is a separate linked application. Publications opens ORCID; no local bibliography is generated.

## Where to edit

- `web/index.html`: introductions, navigation, theme headings, consultancy, recruitment and contact information. Its embedded manuscript/project cards are fallback snapshots.
- `data/content.json`: authoritative rendered manuscript, featured-project and PhD cards. Editing only the fallback HTML will not change a card once the data loads.
- `web/style.css`: theme logo size, layouts and blue design.
- `web/gallery.js` and `web/index.html`: opening sequence behaviour, slide order/captions/dropdown. Update the caption, `data-title` and corresponding option together.
- `web/assets/themes/`: the four supplied theme PNGs, included unchanged; CSS controls displayed size.
- `web/assets/fieldwork/collage/`: twelve downsampled photographs. `web/index.html` and CSS define their mosaic arrangement beside the movie.
- `web/funding.html`, `web/scholarships.html`, `web/scholarships.js`: curated funding guidance. Review eligibility and links manually.
- `worker/initial.json`: test fixture/fallback, not the GitHub build's live content source. Avoid changing it merely to edit an active feature.
- Do not edit generated `site/` or `dist/` as source.

## Local validated content tools

Pull the latest repository before editing to avoid overwriting scheduled data commits. Install Node.js 22+, then:

```sh
git pull
npm run build
node scripts/content-tool.mjs read_lab_content
node scripts/content-tool.mjs check_latest_manuscript
node scripts/content-tool.mjs check_featured_projects
```

These are local repository operations, not public web endpoints. The read tool returns all saved data and detailed schemas are declared in `worker/manuscript.mjs`, `worker/featured.mjs` and `worker/index.mjs`.

For a hand-reviewed latest manuscript, put arguments in a temporary JSON file outside the repository:

```sh
node scripts/content-tool.mjs publish_latest_manuscript /path/to/manuscript-update.json
npm run build
npm test
```

Required arguments: `doi`, `summary` (50–100 words), `evidence_urls`, and `online_date` when required. DOI must match the checked candidate. Optional `figure` requires `source_url`, `caption`, `alt`, `credit`, `license`, and exactly one of `image_url` or `data_base64`. PNG/JPEG/WebP, maximum 3 MiB. Verify DOI association and reuse permission first. Figure bytes go under `data/objects/`; the static build produces a public image URL.

For a pending featured paper use `publish_featured_project` with `doi`, `theme`, `description` (30–100 words), `reason`, `confidence` (0.75–1), `source_text` (the actual primary excerpt used for analysis), `evidence_urls`, and verified `online_date` when required. It must match a pending candidate from `check_featured_projects`. The excerpt is validated but not stored in the published entry. Use `record_featured_project_failure` with `doi` and `reason` for missing evidence or ambiguous classification. `sync_phd_projects` supports hand-verified official Imperial evidence.

After review, commit changed `data/` files and push. A push publishes without immediately rerunning content extraction. A manually added paper figure persists while its DOI remains unchanged; a newly featured DOI starts without a figure.

To run the full automatic updater locally, set `OPENAI_API_KEY` and `OPENAI_MODEL` in your process environment, then run `npm run update`. `.env.example` is documentation only and `.env` is not automatically loaded. This can incur API charges and modifies `data/content.json`; inspect the result before committing.

## Checks, backups and recovery

The Actions summary reports `projects`, `latestManuscript` and `featuredProjects`. A successful deployment is not proof that every source check succeeded. Look for warnings, pending candidates and failed classifications using `read_lab_content`. The installed workflow does not send email or Slack alerts itself.

Git history is the backup for content and archive records. Clone/download the repository including `data/objects/` when present. Keep API secrets separately. To restore content, recover `data/content.json` and relevant figure files from a previous commit, review, then commit the restoration; avoid rewriting history. Disable the schedule first if an updater bug is repeatedly changing data.

## Validation limits

The refreshed package is built and tested locally, including simulated new-paper classification/archive, safe source failures, manuscript/PhD validation, atomic file storage and static output. No real OpenAI billing call, GitHub deployment or DNS change has been performed for your account. Check the first manual Actions run and first scheduled run after installation with your credentials. Current test results and package checks are recorded in `RELEASE-NOTES.md`.

## Public data and licensing

Keep only public research content in `data/`. Never add CVs, transcripts, statements, private email or credentials. API requests contain public abstracts/source excerpts, not visitor/application records. The static output contains no API key. Rights to supplied photos/logos and third-party paper figures remain with their respective owners.
