# FocusProLab — Agent entry

You are working on **FocusProLab** (attention test + V4 scoring + PDF reports + specialist panel).

## Mandatory reading

1. **`docs/CLAUDE-HANDOFF.md`** — full handoff: test phases, scoring, PDF, Supabase, intervention map, footguns.
2. **`.cursor/rules/`** — always-on and area-specific constraints.

## Non-negotiables (short)

- Live scoring = **V4** (`src/scoringVersion.js`). Do not silently switch users to V1–V3.
- Do **not** enable QA flags in `src/testQaMode.js` for production.
- Overall included RT count **may differ** from sum of phase included counts (per-slice IQR). Do not “fix” equality; audit rule B treats explained IQR flips as PASS.
- Keep **A / I / H** separation (FA → I only; idle/multi → H only).
- Do not add a second PostgREST overload of `complete_test_session`.
- Phase `section` label strings feed PDF buckets — rename carefully.
- Practice runs must never call `saveTestSession`.

## Where to start for common tasks

| Task | Start here |
|------|------------|
| Test timing / sections / tempo | `src/profiles.js`, `src/useAttentionTest.js` |
| Distractors | `src/distractors/**`, `src/distractorSchedule.js` |
| Scores A/T/I/H | `src/metricsV3.js` / `metricsV4.js` / `metrics.js` |
| PDF wording / layout | `src/pdfReport.js`, `src/i18n/reportPdfStrings.js` |
| Algorithm audit | `src/lib/algorithmAudit.js` |
| Clients / invites | `src/services/clients.js`, `invites.js`, panels under `src/components/` |

After algorithm or PDF-copy changes that affect stored files, consider report refresh (`ReportRefreshPanel` or `npm run refresh-reports`).
