# Deployment troubleshooting revision — 17 November 2026

- Fixed static export leaking internal updater error text into public status data, which made test 11 reject the literal setting name OPENAI_API_KEY. Public display fields are now explicitly selected; source state and existing content are preserved.
- Added a regression test with saved missing-credential errors and failure histories, checking public exclusion and unchanged source data.
- Corrected Actions permission guidance: job permissions are declared in the workflow; changing repository-wide defaults is normally unnecessary.
- Added exact browser upload/edit and Run workflow instructions, API secret vs model variable setup, and how to locate the actual failing assertion.
- Documented initial configure-pages 404, simulated 503 test output, Ubuntu/Node notices, green-deploy vs source-update status, and preservation of previous content.
- Expanded Squarespace/GitHub domain setup: inherited user-site domains, root URL, old Imperial forwarding, four A records, www CNAME, Google verification and Domain Connect records, and why not to apply Squarespace Defaults.
- Added DNS/redirect cache and HTTPS guidance, safe upgrade instructions, and browser-edit fallback when file download fails.

The original dated ZIP filename is retained; this revision supersedes the earlier package. No live GitHub repository, DNS setting or hosted private Site is changed by downloading it. Tests use fixtures and do not establish real API billing/model access or a successful live updater run.

## Validation

Build and all 25 tests passed, including the saved-error regression. A fresh extraction of the delivered archive was also built and tested. No real API billing call or live GitHub/DNS change was performed.

## Research word cloud

Added automatic title-based ORCID word cloud to Research, deterministic SVG rendering/download, count/date and accessible term list. New standalone `npm run wordcloud` command; existing daily/manual updater now includes it without AI usage. Existing content JSON is preserved; upgrades add only the new data/wordcloud.json alongside source updates. Added counting, version-deduplication, notice/retraction exclusion and safe-SVG tests. Total GitHub tests: 28.

## Word-cloud logo overlay

Research word cloud now overlays the supplied group logo at 60% opacity, matching the image-sequence logo. SVG word background is transparent. Removed the requested caption sentence; automatic counting and exclusions are unchanged. Build and all 28 tests pass.
