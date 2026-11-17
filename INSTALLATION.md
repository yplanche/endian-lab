# Detailed GitHub Pages installation and domain setup

Reviewed and updated 17 November 2026. The ZIP retains its original dated filename but includes the latest website and these revised instructions. You keep ownership of your domain. If Squarespace is its registrar, it can remain there; GitHub Pages becomes the website host. There is no need to buy a Squarespace website subscription just to register/manage the domain.

## 1. What you need

- A GitHub account and permission to create/manage a repository.
- Access to your domain's DNS settings (Squarespace or whichever provider actually manages DNS).
- An OpenAI API key and a supported model ID if you want automatic PhD extraction, new manuscript summaries and featured-paper classification. API usage is separate from your ChatGPT subscription; check current billing/credits in your API account.
- Optional: GitHub Desktop, or Git plus Node.js 22+, for local editing. No Node installation is required if you only use GitHub's website to edit files and Actions to build them.

GitHub Pages is available for public repositories on GitHub Free. Private-repository Pages requires a supported paid plan; check your account/organisation's current entitlements. The published website itself is public. Official guidance: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site .

## 2. Extract and create a repository

1. Unzip `ENDIAN-GitHub-Pages-2026-11-16.zip`.
2. On GitHub, select **New repository**. Suggested name: `endian-lab`. Use the default branch **main**, as expected by the supplied workflow.
3. Choose public or private visibility deliberately. For the simplest free Pages setup, use a public repository. Do not put API keys, applicant documents or private records into this repository.
4. Create an empty repository. Do not initialise a competing README if you intend to use the command-line upload below.
5. Upload the **contents** of the extracted package folder, not the ZIP and not a containing folder named `ENDIAN-GitHub-Pages-2026-11-16`. At the repository root you should see `README.md`, `package.json`, `web/`, `scripts/`, `worker/`, `data/`, `tests/` and `.github/workflows/pages.yml`.

### Option A — GitHub Desktop

1. Install GitHub Desktop from https://desktop.github.com/ and sign in.
2. Clone your new empty repository to a local folder.
3. Copy all files/folders from the extracted package **into the cloned repository folder**. Include `.github`, `.gitignore` and `.env.example`. Do not copy any `.git` folder from another repository (none is included).
4. On macOS, press **Command–Shift–.** in Finder to reveal hidden files. On Windows, enable **View → Show → Hidden items** if necessary.
5. In GitHub Desktop, review the changes, enter a summary such as “Install ENDIAN lab website”, click **Commit to main**, then **Push origin**.

### Option B — terminal

Open a terminal inside the extracted package folder. Replace YOUR-USERNAME and the repository name with your actual GitHub account/repository:

```sh
git init -b main
git add .
git commit -m "Install ENDIAN lab website"
git remote add origin https://github.com/YOUR-USERNAME/endian-lab.git
git push -u origin main
```

Authenticate using GitHub Desktop, GitHub CLI, or GitHub's supported token-based Git authentication. Your GitHub account password is not a Git HTTPS password. Do not paste an authentication token into a tracked file.

### Option C — upload through GitHub's website

On an empty repository, use the **uploading an existing file** link; afterward use **Code → Add file → Upload files**. Upload extracted files, not the ZIP. Do not upload generated `site/` or `dist/` folders. To replace one file, navigate into its existing folder first, then upload the file and commit. Alternatively open the existing file, click the pencil icon, edit and **Commit changes** directly to `main`.


Use **Add file → Upload files**, drag the extracted contents into the repository and commit. Ensure `.github/workflows/pages.yml` is present afterward; Finder/browser uploads may omit hidden directories. If missing, use **Add file → Create new file**, name it `.github/workflows/pages.yml`, and paste the supplied workflow exactly. The workflow must be at that path, not inside an extra wrapper directory.

## 3. Enable GitHub Actions and Pages

1. Repository → **Settings → Actions → General**: permit GitHub Actions. If restricted to selected actions, allow the official `actions/checkout`, `setup-node`, `configure-pages`, `upload-pages-artifact` and `deploy-pages` actions.
2. The supplied workflow explicitly requests the permissions it needs: `contents: write` for saving data and `pages: write` / `id-token: write` for deployment. You normally do **not** need to change the repository-wide default under **Workflow permissions**; a read-only default is compatible with this workflow. Organisation policy or branch protection can still block bot commits and may require administrator help. Do not enable pull-request approval permissions for this installation.
3. Repository → **Settings → Pages** → **Build and deployment → Source**: select **GitHub Actions**. Do not choose “Deploy from a branch” for this package.
4. If an initial run failed before Pages was enabled, open **Actions → Publish and refresh ENDIAN website**, select the failed run and **Re-run all jobs**. A push-triggered build does not call the content-update service, so you can publish the initial site before configuring the API key.
5. A successful deployment appears under the **github-pages** environment. Open its URL, normally `https://YOUR-USERNAME.github.io/endian-lab/`. Publishing may take several minutes.

The repository name can be changed, but keep the workflow on `main` or update both the branch trigger and checkout `ref`. The site uses relative paths and works under a repository subpath.

## 4. Configure automatic content updates

The supplied workflow refreshes content at **07:17 UTC daily** (07:17 UK winter / 08:17 UK summer). It also refreshes when you select **Run workflow**. Ordinary pushes publish your edits without making content-service calls.

1. Repository → **Settings → Secrets and variables → Actions → Secrets → New repository secret**.
2. Name it exactly **OPENAI_API_KEY**. Paste your OpenAI API key as its value. Do not put quotes around the value or add it to the source files.
3. Under **Variables → New repository variable**, create **OPENAI_MODEL**. Its value must be the exact ID of a model available to your API account that supports the Responses API and JSON mode. Choose a current suitable model from your API account's model documentation. No model ID is hard-coded in this package. A current example is `gpt-5.4-mini`; confirm availability in your API account before using it. Create the key at https://platform.openai.com/api-keys and configure API billing separately from ChatGPT. Secrets and variables are different tabs: the key is a **secret**, the model ID is a **variable**. Never share the key in chat, screenshots or source code.
4. Configure an API usage budget/alerts in your API account. Latest manuscript summarisation runs for a new latest DOI. Featured-project analysis separately processes newly listed ORCID journal articles (up to ten per run), even if Latest manuscript is unchanged. PhD extraction runs when its source excerpt changes. Costs depend on model and usage.
5. Click the repository’s top **Actions** tab (not Settings → Actions). In the left sidebar choose **Publish and refresh ENDIAN website**. Above the run list, on the right, click **Run workflow**, select **main**, then click the green **Run workflow** button. Refresh the list and open the newly created run. If the button is missing, check that `.github/workflows/pages.yml` exists on `main`, contains `workflow_dispatch:`, and you have write access. If GitHub shows a workflow-enablement banner, enable it first.
6. Open the run and read its **Summary**, especially **ENDIAN content checks**. Check all three statuses: `latestManuscript`, `featuredProjects` and `projects`. A green deployment means the website deployed; source-status warnings may still indicate that an update could not be completed.
7. Open the published website and check the freshness dates. The workflow saves results to `data/content.json` and deploys the built output in that same run. It does not depend on a bot commit triggering another Pages workflow.

The key is only exposed to the update step, never written into public output. Do not enable this workflow on untrusted pull-request code. A public repository must contain no real `.env` file. `.env.example` is explanatory only and is not automatically loaded.

If ORCID or Imperial project retrieval fails, the source format changes, or an abstract cannot be verified, the site retains the previous manuscript, featured projects and PhD information and reports the failed check. This is deliberate; a blocked page must not erase content. There is no guarantee that every publisher exposes a usable abstract. See `MAINTENANCE.md`.

### Confirm the update sources

Publications and paper detection use https://orcid.org/0000-0002-3624-0757. Keep works public. No ORCID login or API secret is required for reading the current public record. PhD projects still use Imperial. If Imperial blocks direct retrieval, the GitHub updater retains old projects and reports a warning; it does not have the hosted ChatGPT task’s indexed-search fallback.

Only the two newest featured studies per theme stay active; older entries go to `archive.html`. Existing ORCID works were baselined on 17 November 2026, so installation does not repopulate every theme from the old bibliography. New papers without accessible primary evidence or a confident theme remain pending for review/retry.

The 07:00 UK-time ChatGPT task updates only the original private website. It does not maintain a GitHub installation. The workflow in this ZIP must be enabled to maintain the GitHub website. Visitors to GitHub Pages do not need an OpenAI account. Flightdesk remains an independently hosted link with its own access settings.

## 5. Connect your existing domain

Test the default GitHub Pages URL first. Then connect your domain. The following uses `endian.earth` as an example; use the domain you actually own. YOUR-USERNAME means your GitHub user/organisation name, not the repository name.

### A. Verify domain ownership on GitHub

1. Open your GitHub account **Settings → Pages** (for an organisation, its organisation settings).
2. Use **Add a domain** / domain verification, enter your domain, and copy the exact TXT record GitHub provides.
3. In Squarespace Domains, select the domain → **DNS settings** → custom records; add GitHub's TXT host and value exactly. If another provider manages DNS, add it there instead.
4. Return to GitHub and complete verification after the record is visible. Keep the verification record.

Official guide: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages .

### B. Set the website's custom domain in GitHub

Repository → **Settings → Pages → Custom domain**. Enter either:

- `endian.earth` for the root domain as the main address; or
- `www.endian.earth` for `www` as the main address.

If an older `yplanche.github.io` repository already has `endian.earth` as its custom domain, remove the domain from that old repository’s **Settings → Pages** first, then assign it to `endian-lab`. Do not delete either repository. Project sites can inherit the user-site domain and appear at `endian.earth/endian-lab/`; explicitly assigning the domain to `endian-lab` puts the lab at the root. Check old source/CNAME configuration if an old branch-based deployment restores its domain.

Click **Save** before pointing DNS to GitHub. This workflow uses GitHub Actions, so a CNAME file is not required and is not used to configure the custom domain. The repository's Pages setting is authoritative.

### C. Point DNS to GitHub Pages

For this installation the intended final address is **https://endian.earth/**, without `/endian-lab/`. In Squarespace, select `endian.earth` → **DNS settings → Custom records → Add record**. Add each row separately; use a TTL of one hour and leave priority blank/not applicable. For the `www` row below, Yves’s actual target is **yplanche.github.io**.


In the active DNS provider's custom records, set:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `YOUR-USERNAME.github.io` |

These are GitHub's documented Pages addresses checked on 17 November 2026. Recheck the official guide before changing DNS: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site .

- The `www` target has no `https://` and no `/endian-lab/` path.
- Remove/replace **only conflicting website records** at `@` or `www`, such as old Squarespace website defaults. Preserve email-related MX, SPF, DKIM and DMARC records and unrelated TXT records. Preserve GitHub's verification TXT record.
- If old AAAA records point at another host, remove those conflicts or replace them with GitHub's current documented IPv6 records. Do not mix the old host's IPv6 with GitHub's IPv4.
- Do not add a wildcard `*` record. You do not need to transfer your domain registration to GitHub or change nameservers simply to use Pages.
- Configuring both the apex records and `www` allows GitHub to redirect the alternate address to the one selected in Pages settings.

Squarespace guidance: https://support.squarespace.com/hc/en-us/articles/215744668-Pointing-a-Squarespace-domain .

### Squarespace records and warnings to keep separate

- Disable any **domain forwarding / URL redirect** to the Imperial profile. Forwarding is separate from the DNS table; look for domain forwarding in the domain’s website settings.
- Keep `_domainconnect → _domainconnect.domains.squarespace.com`. It uses a separate hostname and does not interfere with GitHub.
- Keep the existing random-name CNAME pointing to `…googlehosted.com`. It appears to verify Google domain ownership; it does not route the root or `www` website. Its original purpose cannot be established from the record alone.
- Keep `www → yplanche.github.io`. Multiple CNAME records on different names do not conflict.
- Squarespace’s **Website → Update DNS records** alert may offer the **Squarespace Defaults** preset. **Do not apply that preset for this GitHub-hosted website**: it is intended to connect Squarespace website hosting and can conflict with GitHub’s records. Registration/DNS can remain at Squarespace without a Squarespace website subscription.

### D. Enable HTTPS and test

1. Wait for DNS checks to pass in GitHub's Pages settings. DNS and certificate provisioning may take up to 24 hours.
2. Select **Enforce HTTPS** once available.
3. Test the root and `www` addresses, all banner theme links, the scholarship and archive pages, smaller theme logos, fieldwork collage/movie, consultancy/ICON link, Imperial portrait, ORCID and Flightdesk buttons.
4. Keep the old site available until this works. Existing domain email should continue if its records were preserved.

## 6. Make future edits

- Edit theme descriptions, consultancy and recruitment text in `web/index.html`.
- Rendered featured projects, archive entries, PhD cards and Latest manuscript come from `data/content.json`. The HTML cards are fallbacks; editing them alone will not update the data-driven display. See `MAINTENANCE.md` for validated editing commands.
- Edit styling in `web/style.css` and scholarship pages in `web/funding.html` / `web/scholarships.html`.
- Edit dynamic content in `data/content.json` only when necessary; scheduled checks maintain it. `worker/initial.json` is a test fixture and is not the live source for the GitHub build.
- Commit and push to `main`. The workflow rebuilds and publishes automatically.
- Do not edit `site/` as the primary source; it is regenerated each build. It is supplied prebuilt for inspection.

## 7. Routine checks and troubleshooting

### Diagnose the actual failed command

Open **Actions → the failed run → build**, then expand the step with the red cross. “Process completed with exit code 1” alone is not a diagnosis. For test failures, search the log for **`not ok`** and read the assertion below it, including `expected`, `actual` and the file/line number. Do not share secrets in logs.

The tests deliberately simulate HTTP 503 responses and use fictional DOIs such as `10.1234/new-study`. Messages inside passing test output are not live ORCID failures or published papers. Read the later **Check ORCID and Imperial; refresh content** step and the content-check summary for real update results.

### Saved-error export failure fixed in this release

Older exports copied internal error messages into `site/data/content.json`. A missing API setting could save “Set OPENAI_API_KEY and OPENAI_MODEL…”, causing test 11 to reject the setting name as if it were leaked data. This was a package defect; that assertion alone did **not** establish that an actual API key leaked.

`scripts/build-pages.mjs` now exports only display fields. Internal errors, manuscript candidates, featured candidates/failure histories and processed DOI lists stay out of the built public JSON; the original data file retains them for retries and maintenance. Tests remain enabled and a regression test checks saved errors explicitly. If this exact failure recurs on an old installation, replace `scripts/build-pages.mjs` with this release’s file and commit. Adding the API settings alone cannot clear a build that fails before its updater runs. Use GitHub’s pencil editor if a standalone `.mjs` download fails; the complete tested correction is in `EXPORT-FIX.md`.

### Domain routing and propagation

- **NotServedByPagesError / alternate name improperly configured:** confirm the four GitHub A records and `www` CNAME, remove only conflicting website records, and disable old forwarding. Keep `endian.earth` saved on the lab repository.
- **DNS Check in Progress:** allow up to 24 hours after correct DNS changes; avoid repeatedly changing records. Recheck in GitHub and enable HTTPS when available.
- **Still sent to Imperial:** check old forwarding and the older user-site domain first. Test in an incognito window, and on a phone using mobile data with Wi-Fi off. Previously cached redirects or DNS can differ between networks. Clear site-specific browser data if a private window works.
- **Default GitHub URL redirects:** this is expected after assigning a custom domain. The intended destination is `https://endian.earth/`.
- **Build vs domain:** a failing test and a DNS check are separate issues. Keep valid DNS unchanged while fixing code. A previous successful deployment can remain online while a newer run fails.
- **Node.js 20 deprecation warning for `configure-pages@v5`:** distinguish this action-runtime warning from an actual failed step. The website’s build uses Node.js 22. Review official action updates when maintaining the workflow; do not replace versions blindly.
- **Ubuntu migration notice:** informational by itself; it does not explain exit code 1.


- **No Actions workflow:** `.github/workflows/pages.yml` is missing, is inside an extra directory, or is not on `main`.
- **Pages setup error:** select **GitHub Actions** as the Pages source, then re-run.
- **Permission denied on bot push:** check Actions write permissions, branch protection and organisation policy. Avoid editing `main` concurrently with an update; if a push is rejected because `main` moved, re-run the workflow. The previous deployment remains available.
- **404 or missing CSS:** verify the artifact uploads `site`, not the repository root or an extra nested folder. Open the Pages deployment URL, including the repository path before connecting a custom domain.
- **401/403 content-service response:** check the API secret, model availability, billing and access. Do not expose the key in logs while diagnosing it.
- **Update warning with a green run:** read the run summary and website freshness notices. Failed sources preserve existing verified content; a green deploy alone does not prove fresh source retrieval.
- **Daily schedule stops:** scheduled Actions may be delayed. Public-repository schedules can be disabled after 60 days without repository activity. Inspect the Actions page regularly, re-enable the workflow if needed, and review the repository at least monthly. Do not assume the schedule is maintenance-free.
- **Domain DNS check fails:** compare the live records with GitHub's official instructions; check for conflicting A/AAAA/CNAME records and confirm that you edited the active DNS provider.
- **HTTPS still unavailable after propagation:** inspect GitHub's HTTPS troubleshooting guide and your DNS/CAA records. Do not disable working email records.

Official references:

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/securing-your-github-pages-site-with-https

## 8. Update an existing GitHub installation

1. Pull/clone the latest `main`, and back up `data/content.json` and any `data/objects/` files. A scheduled run may have newer manuscript, PhD or archive entries than this ZIP.
2. Copy the updated `web/`, `scripts/`, `worker/`, `tests/`, `.github/`, package file and documentation into the repository. Preserve the repository’s `.git` folder and your domain setting in Settings → Pages. Do not copy `site/` or `dist/` as source.
3. Retain your current `data/` rather than blindly overwriting it with the ZIP snapshot. If your older installation lacks `featuredProjects`, the updated worker supplies the packaged baseline on its first state write. Do not remove an existing archive or processed DOI list. If you have not installed the site before, use the supplied complete `data/` unchanged.
4. Run `npm run build` and `npm test` locally if Node is installed; otherwise let Actions run the same checks. Review and commit, then push to `main`.
5. Existing repository secrets/variables and the Pages custom-domain setting survive source updates. Confirm `OPENAI_API_KEY` and `OPENAI_MODEL` remain configured, then run the workflow manually and inspect all three content checks.
6. If Git reports a conflict because a scheduled update committed new data, pull and reconcile it before pushing. Do not force-push over newer content.


## Research word cloud (17 November 2026)

The Research section now includes a responsive, blue SVG word cloud with an SVG download, generation date, paper count and accessible frequency list. It uses every eligible public ORCID paper title, including distinct preprint-only studies, rather than incompletely available abstracts. Duplicate titles/preprint versions, correction/retraction records and the known retracted Resources article are excluded. Word size counts distinct papers containing a term; common/generic words are removed and selected word variants combined. Initial coverage is 28 unique papers. SVG layout is deterministic and some low-frequency terms may not fit.

The existing daily/manual workflow now runs `scripts/update-wordcloud.mjs` as part of `npm run update`. This fetches the ORCID list, compares a digest and recomputes term counts if titles/papers change. It uses **no OpenAI credits** and needs no new secret or Python dependency. A failed/empty retrieval retains the previous cloud and reports a warning. Your API settings are still needed for the separate paper-summary/PhD updater.

To refresh only the cloud locally: run `npm run wordcloud`, then `npm run build`, inspect and commit `data/wordcloud.json`. The simpler GitHub website route remains Actions → Publish and refresh ENDIAN website → Run workflow → main → Run workflow; this also runs the existing content checks. No public visitor button triggers paid analysis.

**Upgrading an existing repository:** replace `web/`, `scripts/`, `worker/`, `tests/` and `package.json`; **add the new `data/wordcloud.json` file**. Preserve the existing `data/content.json` and `data/objects/` rather than overwriting them. No workflow YAML change is required: its existing `npm run update` command invokes the new step and its `git add data/` saves the cloud. Commit to main to deploy. Do not upload generated site/dist as source. No DNS or API-setting change is needed.

The private hosted preview has a separate persisted cloud and an owner tool `recompute_wordcloud`; it can also refresh after its 24-hour cache expires on a page request. The GitHub cloud is regenerated by Actions; visitors only read static files.
