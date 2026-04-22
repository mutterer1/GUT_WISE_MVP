# Pass 3B Normalized Schema

Pass 3A added derived intelligence on top of free-text logs.

Pass 3B begins the real normalization layer so GutWise can move from heuristic analysis toward evidence-backed analysis.

## Added in this pass

- Ingredient reference table
  - canonical ingredient names
  - aliases
  - default gut-related signals
  - typical gut reactions
- Food reference table
  - canonical food items
  - brand-aware variants
  - default serving metadata
  - ingredient composition join table
- Food log child tables
  - one food log can now support multiple normalized item rows
  - each item can support multiple ingredient rows
- Medication reference table
  - generic names
  - brand names
  - medication class
  - route
  - gut relevance
  - common GI effects
- Medication log enrichment columns
  - normalized medication id
  - dose value / dose unit
  - route
  - reason for use
  - regimen status
  - timing context
- Document evidence layer
  - stored artifact metadata
  - extraction lifecycle status
  - extracted text field
  - evidence segment table
  - candidate-to-evidence link table

## Why this matters

This is the first point where the app can eventually answer questions like:

- Was it the meal or a specific ingredient?
- Was it any medication day or a specific class, route, or regimen context?
- Which document line or page supports this medical candidate?

## What this pass does not do yet

- It does not migrate the current UI to write normalized food item rows.
- It does not yet upload files into Supabase Storage.
- It does not yet run OCR or extraction automatically.
- It does not yet backfill old logs into normalized child tables.

## Recommended next implementation order

1. Update food logging to write `food_log_items` for every meal entry.
2. Add ingredient review/edit support per food item.
3. Update medication logging to capture normalized medication ids and structured dose fields.
4. Add document upload to storage plus extraction job creation.
5. Attach candidate medical facts to cited evidence segments during review.
