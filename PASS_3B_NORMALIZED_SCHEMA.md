# Pass 3B - Normalized Intelligence Schema

## Overview

Pass 3B introduces a normalized reference data layer and structured evidence framework to GutWise. This schema enables rich, queryable intelligence about ingredients, foods, and medications—decoupled from free-text logging—while maintaining backward compatibility with existing logs.

**Key Design Principle:** Existing logs remain valid and fully functional. Imported or extracted context remains reviewable before activation into active intelligence.

---

## 1. Global Reference Tables

### `ingredient_reference_items`

Master catalog of ingredients with their digestive and metabolic relevance.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `canonical_name` | text | Unique identifier (e.g., "lactose") |
| `display_name` | text | User-facing name (e.g., "Lactose") |
| `ingredient_category` | text | Category label (e.g., "dairy", "fiber", "fodmap") |
| `fodmap_level` | text | FODMAP classification: `low`, `moderate`, `high`, `unknown` |
| `common_aliases` | text[] | Alternative names for matching |
| `default_signals` | text[] | Common digestive signals (e.g., bloating, cramping) |
| `typical_gut_reactions` | text[] | Expected physiological responses |
| `evidence_notes` | text | Medical/nutritional context |
| `created_at` | timestamptz | Record creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**Uniqueness:** `canonical_name` is globally unique.

---

### `food_reference_items`

Master catalog of foods with serving and brand context.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `canonical_name` | text | Canonical food name (e.g., "chicken breast") |
| `display_name` | text | User-facing name (e.g., "Chicken Breast") |
| `brand_name` | text | Optional brand (e.g., "Perdue") |
| `food_category` | text | Category (e.g., "protein", "vegetable") |
| `default_serving_amount` | numeric | Portion size in standard unit |
| `default_serving_unit` | text | Unit (e.g., "g", "oz", "cup") |
| `common_aliases` | text[] | Alternative names for matching |
| `default_signals` | text[] | Typical digestive signals |
| `source_label` | text | Source of record (default: `gutwise_seed`) |
| `evidence_notes` | text | Context or notes |
| `created_at` | timestamptz | Record creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**Uniqueness:** Combination of `canonical_name` and `brand_name` (or empty) is unique.

---

### `food_reference_ingredients`

Composition mapping: which ingredients comprise each food.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `food_reference_id` | uuid | Foreign key to `food_reference_items` (CASCADE on delete) |
| `ingredient_reference_id` | uuid | Foreign key to `ingredient_reference_items` (RESTRICT on delete) |
| `grams_per_default_serving` | numeric | Quantity of ingredient per serving |
| `ingredient_fraction` | numeric | Ratio of ingredient (0–1) |
| `prominence_rank` | integer | Ordering rank (1 = primary) |
| `is_primary` | boolean | Flag for major ingredients |
| `notes` | text | Optional context |
| `created_at` | timestamptz | Record creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**Uniqueness:** Combination of `food_reference_id` and `ingredient_reference_id` is unique.

---

### `medication_reference_items`

Master catalog of medications with gut-relevance classification.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `generic_name` | text | Generic/drug name (e.g., "omeprazole") |
| `display_name` | text | User-facing name (e.g., "Omeprazole") |
| `brand_names` | text[] | Brand names (e.g., "Prilosec", "Losec") |
| `rxnorm_code` | text | RxNorm unique identifier |
| `medication_class` | text | Class (e.g., "PPI", "H2-blocker") |
| `route` | text | Administration route (e.g., "oral", "IV") |
| `medication_type` | text | Type: `prescription`, `otc`, `supplement`, `unknown` |
| `gut_relevance` | text | Relevance: `primary`, `secondary`, `indirect`, `unknown` |
| `common_gut_effects` | text[] | Documented GI effects |
| `interaction_flags` | text[] | Warnings (e.g., food interactions) |
| `evidence_notes` | text | Medical context |
| `created_at` | timestamptz | Record creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

---

## 2. Food Log Normalization

### `food_log_items`

Normalized per-item rows associated with a food log. Existing `food_logs` remain the canonical event parent.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key to auth.users (CASCADE on delete) |
| `food_log_id` | uuid | Foreign key to `food_logs` (CASCADE on delete) |
| `display_name` | text | User-entered food name |
| `normalized_food_id` | uuid | Foreign key to `food_reference_items` (SET NULL on delete) |
| `quantity_value` | numeric | Amount consumed |
| `quantity_unit` | text | Unit of quantity |
| `preparation_method` | text | How food was prepared (e.g., "baked") |
| `brand_name` | text | Food brand |
| `restaurant_name` | text | Restaurant name (if applicable) |
| `consumed_order` | integer | Order in meal (1st, 2nd item, etc.) |
| `source_method` | text | Origin: `manual_entry`, `autocomplete_match`, `import_candidate`, `derived_from_note` |
| `confidence_score` | numeric | Normalization confidence (0–1) |
| `notes` | text | Item-level notes |
| `created_at` | timestamptz | Record creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**RLS:** Users can view, insert, update, and delete only their own items.

---

### `food_log_item_ingredients`

Ingredient-level evidence for a logged food item, allowing manual, imported, or inferred ingredient breakdown.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key to auth.users (CASCADE on delete) |
| `food_log_item_id` | uuid | Foreign key to `food_log_items` (CASCADE on delete) |
| `ingredient_reference_id` | uuid | Foreign key to `ingredient_reference_items` (SET NULL on delete) |
| `ingredient_name_text` | text | Free-text ingredient name |
| `quantity_estimate` | numeric | Estimated quantity |
| `quantity_unit` | text | Unit of measurement |
| `source_method` | text | Origin: `manual_entry`, `catalog_match`, `document_extraction`, `llm_inference` |
| `confidence_score` | numeric | Match confidence (0–1) |
| `gut_signals_override` | text[] | User-provided signal adjustments |
| `notes` | text | Context |
| `created_at` | timestamptz | Record creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**RLS:** Users can view, insert, update, and delete only their own records.

---

## 3. Medication Log Normalization

The `medication_logs` table is extended with structured fields:

| Column Added | Type | Notes |
|----------|------|-------|
| `normalized_medication_id` | uuid | Foreign key to `medication_reference_items` (SET NULL on delete) |
| `dose_value` | numeric | Numerical dose |
| `dose_unit` | text | Unit (e.g., "mg") |
| `route` | text | Administration route |
| `reason_for_use` | text | Indication or reason |
| `regimen_status` | text | `scheduled`, `as_needed`, `one_time`, `unknown` |
| `timing_context` | text | Timing (e.g., "with food", "at bedtime") |

---

## 4. Document Extraction and Evidence

### Medical Document Intakes (Extended)

The `medical_document_intakes` table gains extraction metadata:

| Column Added | Type | Notes |
|----------|------|-------|
| `storage_bucket` | text | Bucket for stored document |
| `storage_path` | text | Path in storage |
| `content_sha256` | text | SHA-256 hash for integrity |
| `extraction_status` | text | `not_started`, `queued`, `processing`, `completed`, `failed` |
| `extraction_error` | text | Error message if failed |
| `extracted_text` | text | Full extracted text |
| `extracted_at` | timestamptz | Extraction completion time |
| `page_count` | integer | Total pages in document |

---

### `medical_document_evidence_segments`

Document spans or excerpts that can be cited during medical candidate review.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key to auth.users (CASCADE on delete) |
| `document_intake_id` | uuid | Foreign key to `medical_document_intakes` (CASCADE on delete) |
| `page_number` | integer | Page where segment appears |
| `section_label` | text | Document section (e.g., "Medications", "Allergies") |
| `quoted_text` | text | Exact text from document |
| `normalized_text` | text | Cleaned/normalized version |
| `span_start` | integer | Character offset (start) |
| `span_end` | integer | Character offset (end) |
| `extractor_label` | text | Extraction method label |
| `confidence_score` | numeric | Extraction confidence (0–1) |
| `created_at` | timestamptz | Record creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**RLS:** Users can view, insert, update, and delete only their own segments.

---

### `candidate_medical_fact_evidence`

Evidence links connecting a pending medical candidate to one or more cited document spans.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key to auth.users (CASCADE on delete) |
| `candidate_medical_fact_id` | uuid | Foreign key to `candidate_medical_facts` (CASCADE on delete) |
| `document_intake_id` | uuid | Foreign key to `medical_document_intakes` (CASCADE on delete) |
| `evidence_segment_id` | uuid | Foreign key to `medical_document_evidence_segments` (SET NULL on delete) |
| `evidence_kind` | text | Type: `quote`, `summary`, `lab_value`, `medication_list`, `diagnosis_statement`, `procedure_statement` |
| `page_number` | integer | Page reference |
| `cited_text` | text | Text excerpt being cited |
| `confidence_score` | numeric | Citation confidence (0–1) |
| `created_at` | timestamptz | Record creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**RLS:** Users can view, insert, update, and delete only their own records.

---

## 5. Row Level Security (RLS)

### Reference Tables (Public Read)

All reference tables allow authenticated users to **SELECT** without ownership checks:
- `ingredient_reference_items`
- `food_reference_items`
- `food_reference_ingredients`
- `medication_reference_items`

### User Data Tables (Ownership-Based)

Food, medication, and evidence tables enforce strict ownership via `auth.uid() = user_id`:
- `food_log_items`
- `food_log_item_ingredients`
- `medical_document_evidence_segments`
- `candidate_medical_fact_evidence`

All tables have SELECT, INSERT, UPDATE, and DELETE policies.

---

## 6. Indexes

Strategic indexes for performance:

| Table | Index | Purpose |
|-------|-------|---------|
| `ingredient_reference_items` | `display_name` | Lookup by display name |
| `food_reference_items` | `display_name`, `canonical_name + brand_name` | Lookup and uniqueness |
| `food_reference_ingredients` | `food_reference_id`, `ingredient_reference_id` | Composition queries |
| `medication_reference_items` | `display_name`, `generic_name + route` | Lookup and uniqueness |
| `food_log_items` | `user_id + food_log_id + consumed_order`, `normalized_food_id` | User log queries, food lookups |
| `food_log_item_ingredients` | `food_log_item_id`, `ingredient_reference_id` | Ingredient breakdown queries |
| `medication_logs` | `normalized_medication_id` | Medication reference lookups |
| `medical_document_intakes` | `user_id + extraction_status` | Document processing queries |
| `medical_document_evidence_segments` | `document_intake_id` | Evidence by document |
| `candidate_medical_fact_evidence` | `candidate_medical_fact_id`, `document_intake_id` | Evidence links |

---

## 7. Updated-At Triggers

All new tables and modified tables have automatic `updated_at` triggers to maintain timestamp accuracy:

- `ingredient_reference_items`
- `food_reference_items`
- `food_reference_ingredients`
- `medication_reference_items`
- `food_log_items`
- `food_log_item_ingredients`
- `medical_document_evidence_segments`
- `candidate_medical_fact_evidence`

---

## 8. Design Principles Summary

1. **Backward Compatibility:** Existing `food_logs`, `medication_logs`, and `medical_document_intakes` remain the authoritative events. New normalized tables augment, never replace.

2. **Evidence-Driven:** All extracted or inferred data is linked back to source documents via confidence scores and evidence segments.

3. **Ownership-First:** User data is strictly isolated via RLS on all personal tables.

4. **Reference Sharing:** Ingredient, food, and medication references are read-only shared resources for all authenticated users.

5. **Flexibility:** Source methods (`manual_entry`, `autocomplete_match`, `import_candidate`, `llm_inference`, etc.) track how data entered the system.

6. **Reviewable:** Extracted data remains in a "candidate" state (via `candidate_medical_facts`) until a user reviews and activates it.

---

## 9. Key Use Cases

- **Intelligent Autocomplete:** Food logs reference `food_reference_items` to show calories, portions, and ingredient breakdowns.
- **Ingredient Pattern Detection:** `food_log_item_ingredients` enables cross-meal FODMAP and allergen correlation.
- **Medication Intelligence:** `medication_logs` enhanced with structured dose and timing for better symptom correlation.
- **Document Evidence:** Medical records can be uploaded, extracted, and cited as evidence for medical candidates before activation.
- **Audit Trail:** `source_method` and `confidence_score` provide transparency on how each piece of data was generated.

---

## 10. Migration Strategy

- **Phase 1:** Reference tables populated with seed data (ingredients, foods, medications).
- **Phase 2:** Food log normalization (per-item rows and ingredient breakdown) populated on new entries and user opt-in migrations.
- **Phase 3:** Document extraction pipeline activated; evidence segments auto-generated on PDF ingestion.
- **Phase 4:** Candidate medical fact evidence links populated; user review + activation workflow enabled.

All phases maintain full backward compatibility with existing logs.
