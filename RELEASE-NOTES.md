# Package review — 17 November 2026

This release includes the latest live website content: ORCID publications and automated featured studies/archive, all corrected slideshow captions, supplied theme logos at 60% of their previous display size, consultancy navigation and ICON/project examples, and the twelve-photo fieldwork collage beside the Antarctica movie.

## Instructions corrected

- Removed obsolete Imperial-publication-source and manual-featured-project statements.
- Clarified the GitHub Actions schedule (07:17 UTC), API key/model settings and three update statuses.
- Distinguished GitHub Actions from the separate original private website's ChatGPT task.
- Explained primary-evidence failures, pending classifications, archive behaviour and the ten-paper batch limit.
- Corrected editing guidance: active cards come from data/content.json, not just fallback HTML.
- Added safe upgrade instructions preserving newer data and archives.
- Updated current media, consultancy, Node.js and domain/HTTPS setup guidance; clarified the retained ZIP filename.
- Corrected local preview MIME types for JPEG, MP4 and WebP assets.

## Verification

- Build completed successfully; all 24 automated tests passed.
- Editable website files match the current live source.
- All local HTML media/page references resolve; workflow YAML and deployment path validated.
- ORCID API URL, scheduled cron, variable names, commands and source paths agree with the bundled code.
- GitHub's custom-workflow/domain/HTTPS instructions and documented DNS addresses were reviewed against official guidance.
- ZIP checksums, hidden workflow files and a clean-extraction build/test were checked.

No repository was created, real OpenAI API billing call made, GitHub deployment run, or DNS setting changed for your account. Installation still requires your own GitHub repository, Pages/Actions settings and (for full automatic updates) API credentials. Verify the first manual and scheduled Actions runs after installation.
