# Pass 3 Intelligence Layer

This pass adds a first structured intelligence layer on top of the current log model without requiring a full food or medication schema rewrite.

## Scope

- Preserve the current hydration semantics.
- Fix ranked-pipeline drift so canonical hydration events keep normalized hydration fields.
- Allow user-reported medical context to affect ranked insight ordering.
- Derive ingredient-trigger signals from existing food logs.
- Derive medication-family and gut-effect signals from existing medication logs.
- Add a first ingredient-trigger candidate to the ranked insight pipeline.

## What This Pass Does

- `src/lib/canonicalEvents.ts`
  - Preserves normalized hydration fields in canonical hydration payloads.
  - Enriches canonical food events with ingredient-derived trigger signals.
  - Enriches canonical medication events with medication-family and gut-effect signals.
- `src/lib/dailyFeatures.ts`
  - Aggregates the new food and medication intelligence fields into daily features.
- `src/lib/insightCandidates/*`
  - Refines medication candidates to use GI-relevant medication signals instead of any medication day.
  - Expands caffeine exposure to include food-based caffeine, not just beverages.
  - Adds an ingredient-trigger same-day symptom candidate.

## Current Limits

- Food intelligence is still derived from food names and tags, not a normalized ingredient ledger.
- Medication intelligence is still derived from medication-name matching, not full dose/start-stop history.
- Document intake still does not store the underlying artifact, OCR text, or citation spans.
- LLM explanations can now rely on deeper structured signals, but the strongest evidence layer still requires document-backed provenance and richer catalogs.

## Recommended Next Passes

1. Normalize food entities and ingredient compositions.
2. Expand medication catalog coverage with classes, indications, and GI-side-effect profiles.
3. Store document artifacts plus extraction spans so accepted medical facts can cite evidence.
4. Add reviewable imported candidates for foods, meds, and clinical context rather than silently promoting them into official logs.
