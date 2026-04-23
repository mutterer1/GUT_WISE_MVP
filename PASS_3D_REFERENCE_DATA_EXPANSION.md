# Pass 3D Reference Data Expansion

This pass adds a new seed migration:

- `supabase/migrations/20260423103000_seed_reference_data_expansion.sql`

What it seeds:

- broader `ingredient_reference_items`
- broader `food_reference_items`
- first-pass `food_reference_ingredients`
- broader `medication_reference_items`

Why this matters:

- food normalization now has many more realistic matches to land on
- ingredient-driven insights have a larger reference substrate
- medication normalization and medication candidates have more real classes and names to match

Current scope:

- this is a strong first-pass seed layer, not a finished national food or medication database
- it is designed to improve matching and insight quality immediately without changing the schema again

Recommended next step after applying the migration:

- move food and medication autocomplete off local static lists and onto the live Supabase reference tables so the UI reflects the seeded database directly