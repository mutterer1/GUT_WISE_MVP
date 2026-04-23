/*
  # Pass 3D - reference-data expansion

  This migration seeds a broader first-pass reference layer for:
  - ingredient_reference_items
  - food_reference_items
  - food_reference_ingredients
  - medication_reference_items

  It is additive and idempotent. Existing rows are preserved, and canonical
  ingredient rows update in place when they already exist.
*/

WITH ingredient_seed AS (
  SELECT *
  FROM jsonb_to_recordset(
    '[
      {"canonical_name":"onion","display_name":"Onion","ingredient_category":"allium","fodmap_level":"high","common_aliases":["red onion","yellow onion","sweet onion"],"default_signals":["high_fodmap"],"typical_gut_reactions":["bloating","gas","abdominal discomfort"],"evidence_notes":"Common allium trigger."},
      {"canonical_name":"garlic","display_name":"Garlic","ingredient_category":"allium","fodmap_level":"high","common_aliases":["garlic powder","roasted garlic"],"default_signals":["high_fodmap"],"typical_gut_reactions":["bloating","gas","abdominal discomfort"],"evidence_notes":"Common allium trigger."},
      {"canonical_name":"wheat","display_name":"Wheat / Gluten","ingredient_category":"grain","fodmap_level":"high","common_aliases":["gluten","bread","pasta","bagel","pizza crust","flour tortilla"],"default_signals":["gluten","high_fodmap"],"typical_gut_reactions":["bloating","cramping"],"evidence_notes":"Broad gluten-containing grain bucket for first-pass normalization."},
      {"canonical_name":"barley_rye","display_name":"Barley / Rye","ingredient_category":"grain","fodmap_level":"high","common_aliases":["barley","rye"],"default_signals":["gluten","high_fodmap"],"typical_gut_reactions":["bloating","cramping"],"evidence_notes":"Additional gluten-containing grains."},
      {"canonical_name":"milk","display_name":"Milk / Lactose","ingredient_category":"dairy","fodmap_level":"high","common_aliases":["whole milk","skim milk","lactose"],"default_signals":["dairy","high_fodmap"],"typical_gut_reactions":["bloating","gas","diarrhea"],"evidence_notes":"Useful for lactose-heavy foods and drinks."},
      {"canonical_name":"yogurt","display_name":"Yogurt","ingredient_category":"dairy","fodmap_level":"moderate","common_aliases":["greek yogurt"],"default_signals":["dairy","high_fodmap"],"typical_gut_reactions":["bloating","gas","diarrhea"],"evidence_notes":"General yogurt bucket."},
      {"canonical_name":"cheese","display_name":"Cheese","ingredient_category":"dairy","fodmap_level":"moderate","common_aliases":["cheddar","mozzarella","cream cheese","parmesan"],"default_signals":["dairy"],"typical_gut_reactions":["bloating","gas"],"evidence_notes":"Broad cheese bucket."},
      {"canonical_name":"ice_cream","display_name":"Ice Cream","ingredient_category":"dairy","fodmap_level":"high","common_aliases":["gelato","milkshake"],"default_signals":["dairy","high_fodmap","high_fat"],"typical_gut_reactions":["bloating","gas","diarrhea"],"evidence_notes":"Dairy plus fat exposure."},
      {"canonical_name":"beans","display_name":"Beans","ingredient_category":"legume","fodmap_level":"high","common_aliases":["black beans","kidney beans","pinto beans"],"default_signals":["high_fodmap","fiber_dense"],"typical_gut_reactions":["gas","bloating"],"evidence_notes":"Broad bean bucket for burritos, chili, and sides."},
      {"canonical_name":"chickpeas","display_name":"Chickpeas / Hummus","ingredient_category":"legume","fodmap_level":"high","common_aliases":["chickpea","hummus"],"default_signals":["high_fodmap","fiber_dense"],"typical_gut_reactions":["gas","bloating"],"evidence_notes":"Useful for hummus and Mediterranean foods."},
      {"canonical_name":"lentils","display_name":"Lentils","ingredient_category":"legume","fodmap_level":"high","common_aliases":["lentil"],"default_signals":["high_fodmap","fiber_dense"],"typical_gut_reactions":["gas","bloating"],"evidence_notes":"Common legume trigger."},
      {"canonical_name":"broccoli","display_name":"Broccoli","ingredient_category":"vegetable","fodmap_level":"moderate","common_aliases":["broccoli florets"],"default_signals":["fiber_dense"],"typical_gut_reactions":["gas","bloating"],"evidence_notes":"Cruciferous vegetable."},
      {"canonical_name":"cauliflower","display_name":"Cauliflower","ingredient_category":"vegetable","fodmap_level":"high","common_aliases":["cauliflower rice"],"default_signals":["high_fodmap","fiber_dense"],"typical_gut_reactions":["gas","bloating"],"evidence_notes":"Common bloating trigger."},
      {"canonical_name":"cabbage","display_name":"Cabbage / Brussels Sprouts","ingredient_category":"vegetable","fodmap_level":"moderate","common_aliases":["brussels sprouts","coleslaw"],"default_signals":["fiber_dense"],"typical_gut_reactions":["gas","bloating"],"evidence_notes":"Cruciferous vegetable bucket."},
      {"canonical_name":"mushroom","display_name":"Mushrooms","ingredient_category":"vegetable","fodmap_level":"high","common_aliases":["mushrooms"],"default_signals":["high_fodmap"],"typical_gut_reactions":["bloating","gas"],"evidence_notes":"Useful for sauces and bowls."},
      {"canonical_name":"apple","display_name":"Apple","ingredient_category":"fruit","fodmap_level":"high","common_aliases":["applesauce"],"default_signals":["high_fodmap"],"typical_gut_reactions":["bloating","gas"],"evidence_notes":"Common fruit trigger."},
      {"canonical_name":"pear","display_name":"Pear","ingredient_category":"fruit","fodmap_level":"high","common_aliases":["pears"],"default_signals":["high_fodmap"],"typical_gut_reactions":["bloating","gas"],"evidence_notes":"Common fruit trigger."},
      {"canonical_name":"avocado","display_name":"Avocado","ingredient_category":"fruit","fodmap_level":"moderate","common_aliases":["guacamole"],"default_signals":["high_fodmap","high_fat"],"typical_gut_reactions":["bloating","urgency"],"evidence_notes":"High fat plus sorbitol exposure."},
      {"canonical_name":"stone_fruit","display_name":"Stone Fruit","ingredient_category":"fruit","fodmap_level":"high","common_aliases":["peach","plum","nectarine","cherry","apricot"],"default_signals":["high_fodmap"],"typical_gut_reactions":["bloating","gas"],"evidence_notes":"Useful for fruit-heavy snacks and desserts."},
      {"canonical_name":"honey","display_name":"Honey / High-Fructose Sweeteners","ingredient_category":"sweetener","fodmap_level":"high","common_aliases":["high fructose corn syrup","hfcs","agave"],"default_signals":["high_fodmap"],"typical_gut_reactions":["bloating","gas","looser stool"],"evidence_notes":"High fructose sweetener bucket."},
      {"canonical_name":"sugar_alcohols","display_name":"Sugar Alcohols","ingredient_category":"sweetener","fodmap_level":"high","common_aliases":["sorbitol","xylitol","mannitol","erythritol"],"default_signals":["artificial_sweetener","high_fodmap"],"typical_gut_reactions":["bloating","gas","diarrhea"],"evidence_notes":"Common GI trigger group in low-sugar foods."},
      {"canonical_name":"artificial_sweeteners","display_name":"Artificial Sweeteners","ingredient_category":"sweetener","fodmap_level":"unknown","common_aliases":["sucralose","aspartame","acesulfame","saccharin","diet soda"],"default_signals":["artificial_sweetener"],"typical_gut_reactions":["bloating","gas","diarrhea"],"evidence_notes":"Non-nutritive sweetener bucket."},
      {"canonical_name":"fried_oil","display_name":"Fried Cooking Oil","ingredient_category":"fat","fodmap_level":"unknown","common_aliases":["fried","greasy","fast food oil"],"default_signals":["high_fat"],"typical_gut_reactions":["nausea","urgency","reflux"],"evidence_notes":"Used for fries and fried foods."},
      {"canonical_name":"cream_sauce","display_name":"Cream / Rich Sauce","ingredient_category":"fat","fodmap_level":"moderate","common_aliases":["alfredo","cream sauce","creamy sauce"],"default_signals":["dairy","high_fat"],"typical_gut_reactions":["bloating","nausea","reflux"],"evidence_notes":"Useful for creamy pasta and curry dishes."},
      {"canonical_name":"chili_pepper","display_name":"Spicy Pepper / Hot Sauce","ingredient_category":"seasoning","fodmap_level":"unknown","common_aliases":["jalapeno","hot sauce","buffalo sauce","curry"],"default_signals":["spicy"],"typical_gut_reactions":["burning","urgency","abdominal pain"],"evidence_notes":"Spicy-food bucket."},
      {"canonical_name":"coffee","display_name":"Coffee","ingredient_category":"beverage","fodmap_level":"low","common_aliases":["espresso","cold brew","americano","latte"],"default_signals":["caffeine_food"],"typical_gut_reactions":["urgency","reflux","stimulation"],"evidence_notes":"Caffeine exposure from coffee drinks."},
      {"canonical_name":"black_tea","display_name":"Caffeinated Tea","ingredient_category":"beverage","fodmap_level":"low","common_aliases":["black tea","green tea","matcha","chai"],"default_signals":["caffeine_food"],"typical_gut_reactions":["stimulation","reflux"],"evidence_notes":"Caffeine exposure from tea drinks."},
      {"canonical_name":"chocolate","display_name":"Chocolate","ingredient_category":"dessert","fodmap_level":"moderate","common_aliases":["cocoa","brownie"],"default_signals":["caffeine_food","high_fat"],"typical_gut_reactions":["reflux","stimulation"],"evidence_notes":"Chocolate can carry both fat and caffeine-like stimulation."},
      {"canonical_name":"beer","display_name":"Beer","ingredient_category":"alcohol","fodmap_level":"moderate","common_aliases":["ipa","lager","ale"],"default_signals":["alcohol","gluten"],"typical_gut_reactions":["diarrhea","reflux","irritation"],"evidence_notes":"Beer combines alcohol with grain exposure."},
      {"canonical_name":"wine","display_name":"Wine / Spirits","ingredient_category":"alcohol","fodmap_level":"low","common_aliases":["red wine","white wine","vodka","whiskey","tequila","cocktail"],"default_signals":["alcohol"],"typical_gut_reactions":["diarrhea","reflux","irritation"],"evidence_notes":"General alcohol bucket."},
      {"canonical_name":"oats","display_name":"Oats","ingredient_category":"grain","fodmap_level":"low","common_aliases":["oatmeal","overnight oats"],"default_signals":["fiber_dense"],"typical_gut_reactions":["fullness","bulk increase"],"evidence_notes":"Neutral-to-helpful fiber source for many users."},
      {"canonical_name":"nuts_and_seeds","display_name":"Nuts / Seeds","ingredient_category":"seed","fodmap_level":"moderate","common_aliases":["almonds","peanuts","chia","flax"],"default_signals":["fiber_dense","high_fat"],"typical_gut_reactions":["fullness","bloating"],"evidence_notes":"Useful for bars and snacks."},
      {"canonical_name":"chicken","display_name":"Chicken","ingredient_category":"protein","fodmap_level":"low","common_aliases":["grilled chicken","chicken breast"],"default_signals":[],"typical_gut_reactions":[],"evidence_notes":"Neutral protein reference."},
      {"canonical_name":"rice","display_name":"Rice","ingredient_category":"grain","fodmap_level":"low","common_aliases":["white rice","jasmine rice","basmati rice"],"default_signals":[],"typical_gut_reactions":[],"evidence_notes":"Neutral grain reference."},
      {"canonical_name":"egg","display_name":"Egg","ingredient_category":"protein","fodmap_level":"low","common_aliases":["eggs","scrambled eggs","omelet"],"default_signals":[],"typical_gut_reactions":[],"evidence_notes":"Neutral protein reference."},
      {"canonical_name":"banana","display_name":"Banana","ingredient_category":"fruit","fodmap_level":"low","common_aliases":["bananas"],"default_signals":[],"typical_gut_reactions":[],"evidence_notes":"Neutral fruit reference."},
      {"canonical_name":"blueberries","display_name":"Blueberries","ingredient_category":"fruit","fodmap_level":"low","common_aliases":["blueberry"],"default_signals":[],"typical_gut_reactions":[],"evidence_notes":"Neutral fruit reference."},
      {"canonical_name":"potato","display_name":"Potato","ingredient_category":"starch","fodmap_level":"low","common_aliases":["potatoes","baked potato"],"default_signals":[],"typical_gut_reactions":[],"evidence_notes":"Neutral starch reference."},
      {"canonical_name":"tomato","display_name":"Tomato","ingredient_category":"vegetable","fodmap_level":"low","common_aliases":["tomatoes","marinara","red sauce"],"default_signals":[],"typical_gut_reactions":["reflux"],"evidence_notes":"Useful for red-sauce foods."},
      {"canonical_name":"salmon","display_name":"Salmon","ingredient_category":"protein","fodmap_level":"low","common_aliases":["salmon fillet"],"default_signals":[],"typical_gut_reactions":[],"evidence_notes":"Neutral protein reference."},
      {"canonical_name":"turkey","display_name":"Turkey","ingredient_category":"protein","fodmap_level":"low","common_aliases":["turkey breast"],"default_signals":[],"typical_gut_reactions":[],"evidence_notes":"Neutral protein reference."}
    ]'::jsonb
  ) AS x(
    canonical_name text,
    display_name text,
    ingredient_category text,
    fodmap_level text,
    common_aliases text[],
    default_signals text[],
    typical_gut_reactions text[],
    evidence_notes text
  )
)
INSERT INTO ingredient_reference_items (
  canonical_name,
  display_name,
  ingredient_category,
  fodmap_level,
  common_aliases,
  default_signals,
  typical_gut_reactions,
  evidence_notes
)
SELECT
  canonical_name,
  display_name,
  ingredient_category,
  fodmap_level,
  common_aliases,
  default_signals,
  typical_gut_reactions,
  evidence_notes
FROM ingredient_seed
ON CONFLICT (canonical_name) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  ingredient_category = EXCLUDED.ingredient_category,
  fodmap_level = EXCLUDED.fodmap_level,
  common_aliases = EXCLUDED.common_aliases,
  default_signals = EXCLUDED.default_signals,
  typical_gut_reactions = EXCLUDED.typical_gut_reactions,
  evidence_notes = EXCLUDED.evidence_notes,
  updated_at = now();

WITH food_seed AS (
  SELECT *
  FROM jsonb_to_recordset(
    '[
      {"canonical_name":"grilled_chicken_breast","display_name":"Grilled Chicken","brand_name":null,"food_category":"protein","default_serving_amount":100,"default_serving_unit":"g","common_aliases":["chicken breast"],"default_signals":[],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Neutral protein anchor food."},
      {"canonical_name":"white_rice","display_name":"White Rice","brand_name":null,"food_category":"grain","default_serving_amount":1,"default_serving_unit":"cup","common_aliases":["rice","jasmine rice","basmati rice"],"default_signals":[],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Neutral starch anchor food."},
      {"canonical_name":"oatmeal","display_name":"Oatmeal","brand_name":null,"food_category":"breakfast","default_serving_amount":1,"default_serving_unit":"cup","common_aliases":["oats","overnight oats"],"default_signals":["fiber_dense"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Common breakfast fiber food."},
      {"canonical_name":"scrambled_eggs","display_name":"Scrambled Eggs","brand_name":null,"food_category":"breakfast","default_serving_amount":2,"default_serving_unit":"eggs","common_aliases":["eggs"],"default_signals":[],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Neutral protein breakfast food."},
      {"canonical_name":"banana","display_name":"Banana","brand_name":null,"food_category":"fruit","default_serving_amount":1,"default_serving_unit":"medium","common_aliases":["bananas"],"default_signals":[],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Neutral fruit."},
      {"canonical_name":"blueberries","display_name":"Blueberries","brand_name":null,"food_category":"fruit","default_serving_amount":1,"default_serving_unit":"cup","common_aliases":["blueberry"],"default_signals":[],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Neutral fruit."},
      {"canonical_name":"greek_yogurt","display_name":"Greek Yogurt","brand_name":null,"food_category":"dairy","default_serving_amount":1,"default_serving_unit":"cup","common_aliases":["yogurt"],"default_signals":["dairy","high_fodmap"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"General cultured dairy food."},
      {"canonical_name":"cheddar_cheese","display_name":"Cheddar Cheese","brand_name":null,"food_category":"dairy","default_serving_amount":1,"default_serving_unit":"oz","common_aliases":["cheese"],"default_signals":["dairy"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Common dairy ingredient."},
      {"canonical_name":"whole_milk_latte","display_name":"Whole Milk Latte","brand_name":null,"food_category":"beverage","default_serving_amount":12,"default_serving_unit":"oz","common_aliases":["latte"],"default_signals":["dairy","caffeine_food"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Coffee drink with dairy exposure."},
      {"canonical_name":"pizza_slice","display_name":"Pizza","brand_name":null,"food_category":"fast_food","default_serving_amount":1,"default_serving_unit":"slice","common_aliases":["pizza slice"],"default_signals":["gluten","dairy","high_fat"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Common multi-trigger meal."},
      {"canonical_name":"macaroni_and_cheese","display_name":"Mac and Cheese","brand_name":null,"food_category":"comfort_food","default_serving_amount":1,"default_serving_unit":"cup","common_aliases":["mac and cheese","macaroni cheese"],"default_signals":["gluten","dairy","high_fat"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Rich wheat-and-dairy food."},
      {"canonical_name":"cheeseburger","display_name":"Cheeseburger","brand_name":null,"food_category":"fast_food","default_serving_amount":1,"default_serving_unit":"burger","common_aliases":["burger"],"default_signals":["gluten","dairy","high_fat"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Fast-food burger pattern."},
      {"canonical_name":"french_fries","display_name":"French Fries","brand_name":null,"food_category":"fast_food","default_serving_amount":1,"default_serving_unit":"medium","common_aliases":["fries"],"default_signals":["high_fat"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Fried starch food."},
      {"canonical_name":"turkey_sandwich","display_name":"Turkey Sandwich","brand_name":null,"food_category":"sandwich","default_serving_amount":1,"default_serving_unit":"sandwich","common_aliases":["sandwich"],"default_signals":["gluten","dairy"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Common lunch sandwich."},
      {"canonical_name":"pasta_with_tomato_sauce","display_name":"Pasta with Tomato Sauce","brand_name":null,"food_category":"pasta","default_serving_amount":1,"default_serving_unit":"bowl","common_aliases":["pasta","red sauce pasta","spaghetti"],"default_signals":["gluten","high_fodmap"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Wheat pasta with red sauce and common alliums."},
      {"canonical_name":"black_bean_burrito","display_name":"Black Bean Burrito","brand_name":null,"food_category":"mexican","default_serving_amount":1,"default_serving_unit":"burrito","common_aliases":["bean burrito"],"default_signals":["gluten","high_fodmap","fiber_dense","dairy"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Common bean-and-tortilla meal."},
      {"canonical_name":"hummus_and_pita","display_name":"Hummus and Pita","brand_name":null,"food_category":"snack","default_serving_amount":1,"default_serving_unit":"plate","common_aliases":["hummus"],"default_signals":["gluten","high_fodmap","fiber_dense"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Mediterranean snack plate."},
      {"canonical_name":"broccoli_side","display_name":"Broccoli Side","brand_name":null,"food_category":"side","default_serving_amount":1,"default_serving_unit":"cup","common_aliases":["broccoli"],"default_signals":["fiber_dense"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Simple cruciferous side."},
      {"canonical_name":"cauliflower_bowl","display_name":"Cauliflower Bowl","brand_name":null,"food_category":"bowl","default_serving_amount":1,"default_serving_unit":"bowl","common_aliases":["cauliflower rice bowl"],"default_signals":["high_fodmap","fiber_dense"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"High-FODMAP cruciferous bowl."},
      {"canonical_name":"apple","display_name":"Apple","brand_name":null,"food_category":"fruit","default_serving_amount":1,"default_serving_unit":"medium","common_aliases":["apple slices"],"default_signals":["high_fodmap"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Common fruit trigger."},
      {"canonical_name":"avocado_toast","display_name":"Avocado Toast","brand_name":null,"food_category":"breakfast","default_serving_amount":1,"default_serving_unit":"slice","common_aliases":["avocado on toast"],"default_signals":["gluten","high_fat","high_fodmap"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Popular breakfast with avocado and wheat."},
      {"canonical_name":"ice_cream","display_name":"Ice Cream","brand_name":null,"food_category":"dessert","default_serving_amount":1,"default_serving_unit":"cup","common_aliases":["gelato"],"default_signals":["dairy","high_fodmap","high_fat"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Dairy dessert pattern."},
      {"canonical_name":"diet_soda","display_name":"Diet Soda","brand_name":null,"food_category":"beverage","default_serving_amount":12,"default_serving_unit":"oz","common_aliases":["soda zero","diet cola"],"default_signals":["artificial_sweetener","caffeine_food"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Diet beverage with sweetener exposure."},
      {"canonical_name":"cold_brew_coffee","display_name":"Cold Brew Coffee","brand_name":null,"food_category":"beverage","default_serving_amount":12,"default_serving_unit":"oz","common_aliases":["coffee"],"default_signals":["caffeine_food"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Coffee exposure."},
      {"canonical_name":"ipa_beer","display_name":"IPA Beer","brand_name":null,"food_category":"alcohol","default_serving_amount":12,"default_serving_unit":"oz","common_aliases":["beer","ale"],"default_signals":["alcohol","gluten"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Beer exposure."},
      {"canonical_name":"red_wine_glass","display_name":"Red Wine","brand_name":null,"food_category":"alcohol","default_serving_amount":5,"default_serving_unit":"oz","common_aliases":["wine"],"default_signals":["alcohol"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Wine exposure."},
      {"canonical_name":"spicy_curry","display_name":"Spicy Curry","brand_name":null,"food_category":"entree","default_serving_amount":1,"default_serving_unit":"bowl","common_aliases":["curry"],"default_signals":["spicy","high_fodmap","high_fat"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Spiced entrée with alliums and rich sauce."},
      {"canonical_name":"chili_bowl","display_name":"Chili Bowl","brand_name":null,"food_category":"entree","default_serving_amount":1,"default_serving_unit":"bowl","common_aliases":["chili"],"default_signals":["spicy","high_fodmap","fiber_dense"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Bean-and-spice entrée."},
      {"canonical_name":"chocolate_bar","display_name":"Chocolate Bar","brand_name":null,"food_category":"dessert","default_serving_amount":1,"default_serving_unit":"bar","common_aliases":["chocolate"],"default_signals":["caffeine_food","high_fat"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Chocolate snack."},
      {"canonical_name":"salmon_and_rice","display_name":"Salmon and Rice","brand_name":null,"food_category":"entree","default_serving_amount":1,"default_serving_unit":"plate","common_aliases":["salmon bowl"],"default_signals":[],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Neutral protein-and-starch entrée."},
      {"canonical_name":"protein_bar","display_name":"Protein Bar","brand_name":null,"food_category":"snack","default_serving_amount":1,"default_serving_unit":"bar","common_aliases":["bar"],"default_signals":["artificial_sweetener","high_fat"],"source_label":"gutwise_seed_pass_3d","evidence_notes":"Common packaged snack with sweetener or rich ingredients."}
    ]'::jsonb
  ) AS x(
    canonical_name text,
    display_name text,
    brand_name text,
    food_category text,
    default_serving_amount numeric,
    default_serving_unit text,
    common_aliases text[],
    default_signals text[],
    source_label text,
    evidence_notes text
  )
)
INSERT INTO food_reference_items (
  canonical_name,
  display_name,
  brand_name,
  food_category,
  default_serving_amount,
  default_serving_unit,
  common_aliases,
  default_signals,
  source_label,
  evidence_notes
)
SELECT
  canonical_name,
  display_name,
  brand_name,
  food_category,
  default_serving_amount,
  default_serving_unit,
  common_aliases,
  default_signals,
  source_label,
  evidence_notes
FROM food_seed seed
WHERE NOT EXISTS (
  SELECT 1
  FROM food_reference_items existing
  WHERE existing.canonical_name = seed.canonical_name
    AND COALESCE(existing.brand_name, '') = COALESCE(seed.brand_name, '')
);

WITH composition_seed AS (
  SELECT *
  FROM jsonb_to_recordset(
    '[
      {"food_canonical_name":"grilled_chicken_breast","ingredient_canonical_name":"chicken","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Simple protein entry."},
      {"food_canonical_name":"white_rice","ingredient_canonical_name":"rice","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Simple starch entry."},
      {"food_canonical_name":"oatmeal","ingredient_canonical_name":"oats","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Primary cereal grain."},
      {"food_canonical_name":"scrambled_eggs","ingredient_canonical_name":"egg","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Primary protein."},
      {"food_canonical_name":"banana","ingredient_canonical_name":"banana","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Single-fruit food."},
      {"food_canonical_name":"blueberries","ingredient_canonical_name":"blueberries","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Single-fruit food."},
      {"food_canonical_name":"greek_yogurt","ingredient_canonical_name":"yogurt","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Primary dairy ingredient."},
      {"food_canonical_name":"cheddar_cheese","ingredient_canonical_name":"cheese","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Primary dairy ingredient."},
      {"food_canonical_name":"whole_milk_latte","ingredient_canonical_name":"milk","ingredient_fraction":0.7,"prominence_rank":1,"is_primary":true,"notes":"Milk base."},
      {"food_canonical_name":"whole_milk_latte","ingredient_canonical_name":"coffee","ingredient_fraction":0.3,"prominence_rank":2,"is_primary":false,"notes":"Coffee component."},
      {"food_canonical_name":"pizza_slice","ingredient_canonical_name":"wheat","ingredient_fraction":0.45,"prominence_rank":1,"is_primary":true,"notes":"Crust exposure."},
      {"food_canonical_name":"pizza_slice","ingredient_canonical_name":"cheese","ingredient_fraction":0.3,"prominence_rank":2,"is_primary":false,"notes":"Cheese exposure."},
      {"food_canonical_name":"pizza_slice","ingredient_canonical_name":"tomato","ingredient_fraction":0.15,"prominence_rank":3,"is_primary":false,"notes":"Sauce exposure."},
      {"food_canonical_name":"macaroni_and_cheese","ingredient_canonical_name":"wheat","ingredient_fraction":0.45,"prominence_rank":1,"is_primary":true,"notes":"Pasta base."},
      {"food_canonical_name":"macaroni_and_cheese","ingredient_canonical_name":"cheese","ingredient_fraction":0.3,"prominence_rank":2,"is_primary":false,"notes":"Cheese exposure."},
      {"food_canonical_name":"macaroni_and_cheese","ingredient_canonical_name":"milk","ingredient_fraction":0.2,"prominence_rank":3,"is_primary":false,"notes":"Milk exposure."},
      {"food_canonical_name":"cheeseburger","ingredient_canonical_name":"wheat","ingredient_fraction":0.25,"prominence_rank":1,"is_primary":true,"notes":"Bun exposure."},
      {"food_canonical_name":"cheeseburger","ingredient_canonical_name":"cheese","ingredient_fraction":0.1,"prominence_rank":2,"is_primary":false,"notes":"Cheese exposure."},
      {"food_canonical_name":"cheeseburger","ingredient_canonical_name":"fried_oil","ingredient_fraction":0.1,"prominence_rank":3,"is_primary":false,"notes":"High-fat fast-food pattern."},
      {"food_canonical_name":"french_fries","ingredient_canonical_name":"potato","ingredient_fraction":0.7,"prominence_rank":1,"is_primary":true,"notes":"Primary starch."},
      {"food_canonical_name":"french_fries","ingredient_canonical_name":"fried_oil","ingredient_fraction":0.3,"prominence_rank":2,"is_primary":false,"notes":"Frying oil."},
      {"food_canonical_name":"turkey_sandwich","ingredient_canonical_name":"turkey","ingredient_fraction":0.35,"prominence_rank":1,"is_primary":true,"notes":"Primary protein."},
      {"food_canonical_name":"turkey_sandwich","ingredient_canonical_name":"wheat","ingredient_fraction":0.35,"prominence_rank":2,"is_primary":false,"notes":"Bread exposure."},
      {"food_canonical_name":"turkey_sandwich","ingredient_canonical_name":"cheese","ingredient_fraction":0.1,"prominence_rank":3,"is_primary":false,"notes":"Optional cheese exposure."},
      {"food_canonical_name":"pasta_with_tomato_sauce","ingredient_canonical_name":"wheat","ingredient_fraction":0.55,"prominence_rank":1,"is_primary":true,"notes":"Pasta base."},
      {"food_canonical_name":"pasta_with_tomato_sauce","ingredient_canonical_name":"tomato","ingredient_fraction":0.2,"prominence_rank":2,"is_primary":false,"notes":"Sauce base."},
      {"food_canonical_name":"pasta_with_tomato_sauce","ingredient_canonical_name":"onion","ingredient_fraction":0.1,"prominence_rank":3,"is_primary":false,"notes":"Common sauce aromatic."},
      {"food_canonical_name":"pasta_with_tomato_sauce","ingredient_canonical_name":"garlic","ingredient_fraction":0.05,"prominence_rank":4,"is_primary":false,"notes":"Common sauce aromatic."},
      {"food_canonical_name":"black_bean_burrito","ingredient_canonical_name":"beans","ingredient_fraction":0.35,"prominence_rank":1,"is_primary":true,"notes":"Bean filling."},
      {"food_canonical_name":"black_bean_burrito","ingredient_canonical_name":"wheat","ingredient_fraction":0.3,"prominence_rank":2,"is_primary":false,"notes":"Flour tortilla."},
      {"food_canonical_name":"black_bean_burrito","ingredient_canonical_name":"cheese","ingredient_fraction":0.1,"prominence_rank":3,"is_primary":false,"notes":"Cheese filling."},
      {"food_canonical_name":"black_bean_burrito","ingredient_canonical_name":"onion","ingredient_fraction":0.05,"prominence_rank":4,"is_primary":false,"notes":"Common aromatic."},
      {"food_canonical_name":"hummus_and_pita","ingredient_canonical_name":"chickpeas","ingredient_fraction":0.4,"prominence_rank":1,"is_primary":true,"notes":"Hummus base."},
      {"food_canonical_name":"hummus_and_pita","ingredient_canonical_name":"wheat","ingredient_fraction":0.35,"prominence_rank":2,"is_primary":false,"notes":"Pita bread."},
      {"food_canonical_name":"hummus_and_pita","ingredient_canonical_name":"garlic","ingredient_fraction":0.05,"prominence_rank":3,"is_primary":false,"notes":"Common hummus aromatic."},
      {"food_canonical_name":"broccoli_side","ingredient_canonical_name":"broccoli","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Simple vegetable side."},
      {"food_canonical_name":"cauliflower_bowl","ingredient_canonical_name":"cauliflower","ingredient_fraction":0.7,"prominence_rank":1,"is_primary":true,"notes":"Cauliflower rice base."},
      {"food_canonical_name":"cauliflower_bowl","ingredient_canonical_name":"broccoli","ingredient_fraction":0.2,"prominence_rank":2,"is_primary":false,"notes":"Common vegetable mix."},
      {"food_canonical_name":"apple","ingredient_canonical_name":"apple","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Single-fruit food."},
      {"food_canonical_name":"avocado_toast","ingredient_canonical_name":"avocado","ingredient_fraction":0.4,"prominence_rank":1,"is_primary":true,"notes":"Primary topping."},
      {"food_canonical_name":"avocado_toast","ingredient_canonical_name":"wheat","ingredient_fraction":0.35,"prominence_rank":2,"is_primary":false,"notes":"Toast base."},
      {"food_canonical_name":"ice_cream","ingredient_canonical_name":"ice_cream","ingredient_fraction":0.7,"prominence_rank":1,"is_primary":true,"notes":"Dairy dessert base."},
      {"food_canonical_name":"ice_cream","ingredient_canonical_name":"milk","ingredient_fraction":0.2,"prominence_rank":2,"is_primary":false,"notes":"Additional dairy exposure."},
      {"food_canonical_name":"diet_soda","ingredient_canonical_name":"artificial_sweeteners","ingredient_fraction":0.05,"prominence_rank":1,"is_primary":true,"notes":"Nonnutritive sweetener exposure."},
      {"food_canonical_name":"diet_soda","ingredient_canonical_name":"coffee","ingredient_fraction":0.01,"prominence_rank":2,"is_primary":false,"notes":"Used to model caffeinated cola-style beverages."},
      {"food_canonical_name":"cold_brew_coffee","ingredient_canonical_name":"coffee","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Primary beverage component."},
      {"food_canonical_name":"ipa_beer","ingredient_canonical_name":"beer","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Alcohol beverage."},
      {"food_canonical_name":"red_wine_glass","ingredient_canonical_name":"wine","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Alcohol beverage."},
      {"food_canonical_name":"spicy_curry","ingredient_canonical_name":"chili_pepper","ingredient_fraction":0.15,"prominence_rank":1,"is_primary":true,"notes":"Spice exposure."},
      {"food_canonical_name":"spicy_curry","ingredient_canonical_name":"onion","ingredient_fraction":0.1,"prominence_rank":2,"is_primary":false,"notes":"Common curry aromatic."},
      {"food_canonical_name":"spicy_curry","ingredient_canonical_name":"garlic","ingredient_fraction":0.05,"prominence_rank":3,"is_primary":false,"notes":"Common curry aromatic."},
      {"food_canonical_name":"spicy_curry","ingredient_canonical_name":"cream_sauce","ingredient_fraction":0.15,"prominence_rank":4,"is_primary":false,"notes":"Rich sauce component."},
      {"food_canonical_name":"chili_bowl","ingredient_canonical_name":"beans","ingredient_fraction":0.35,"prominence_rank":1,"is_primary":true,"notes":"Bean base."},
      {"food_canonical_name":"chili_bowl","ingredient_canonical_name":"chili_pepper","ingredient_fraction":0.1,"prominence_rank":2,"is_primary":false,"notes":"Spice exposure."},
      {"food_canonical_name":"chili_bowl","ingredient_canonical_name":"onion","ingredient_fraction":0.08,"prominence_rank":3,"is_primary":false,"notes":"Common chili aromatic."},
      {"food_canonical_name":"chili_bowl","ingredient_canonical_name":"tomato","ingredient_fraction":0.1,"prominence_rank":4,"is_primary":false,"notes":"Tomato base."},
      {"food_canonical_name":"chocolate_bar","ingredient_canonical_name":"chocolate","ingredient_fraction":1.0,"prominence_rank":1,"is_primary":true,"notes":"Chocolate snack."},
      {"food_canonical_name":"salmon_and_rice","ingredient_canonical_name":"salmon","ingredient_fraction":0.45,"prominence_rank":1,"is_primary":true,"notes":"Primary protein."},
      {"food_canonical_name":"salmon_and_rice","ingredient_canonical_name":"rice","ingredient_fraction":0.45,"prominence_rank":2,"is_primary":false,"notes":"Primary starch."},
      {"food_canonical_name":"protein_bar","ingredient_canonical_name":"artificial_sweeteners","ingredient_fraction":0.05,"prominence_rank":1,"is_primary":true,"notes":"Sweetener exposure."},
      {"food_canonical_name":"protein_bar","ingredient_canonical_name":"nuts_and_seeds","ingredient_fraction":0.15,"prominence_rank":2,"is_primary":false,"notes":"Common bar filler."},
      {"food_canonical_name":"protein_bar","ingredient_canonical_name":"chocolate","ingredient_fraction":0.1,"prominence_rank":3,"is_primary":false,"notes":"Chocolate coating or flavoring."}
    ]'::jsonb
  ) AS x(
    food_canonical_name text,
    ingredient_canonical_name text,
    ingredient_fraction numeric,
    prominence_rank integer,
    is_primary boolean,
    notes text
  )
)
INSERT INTO food_reference_ingredients (
  food_reference_id,
  ingredient_reference_id,
  grams_per_default_serving,
  ingredient_fraction,
  prominence_rank,
  is_primary,
  notes
)
SELECT
  food_item.id,
  ingredient_item.id,
  CASE
    WHEN food_item.default_serving_amount IS NOT NULL AND composition_seed.ingredient_fraction IS NOT NULL
      AND food_item.default_serving_unit = 'g'
    THEN food_item.default_serving_amount * composition_seed.ingredient_fraction
    ELSE NULL
  END AS grams_per_default_serving,
  composition_seed.ingredient_fraction,
  composition_seed.prominence_rank,
  composition_seed.is_primary,
  composition_seed.notes
FROM composition_seed
JOIN food_reference_items food_item
  ON food_item.canonical_name = composition_seed.food_canonical_name
JOIN ingredient_reference_items ingredient_item
  ON ingredient_item.canonical_name = composition_seed.ingredient_canonical_name
WHERE NOT EXISTS (
  SELECT 1
  FROM food_reference_ingredients existing
  WHERE existing.food_reference_id = food_item.id
    AND existing.ingredient_reference_id = ingredient_item.id
);

WITH medication_seed AS (
  SELECT *
  FROM jsonb_to_recordset(
    '[
      {"generic_name":"omeprazole","display_name":"Omeprazole","brand_names":["Prilosec"],"rxnorm_code":null,"medication_class":"proton pump inhibitor","route":"oral","medication_type":"otc","gut_relevance":"primary","common_gut_effects":["acid suppression","bloating","microbiome shift"],"interaction_flags":["acid_suppression"],"evidence_notes":"PPI used for reflux and acid suppression."},
      {"generic_name":"pantoprazole","display_name":"Pantoprazole","brand_names":["Protonix"],"rxnorm_code":null,"medication_class":"proton pump inhibitor","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["acid suppression","bloating","microbiome shift"],"interaction_flags":["acid_suppression"],"evidence_notes":"Prescription PPI."},
      {"generic_name":"esomeprazole","display_name":"Esomeprazole","brand_names":["Nexium"],"rxnorm_code":null,"medication_class":"proton pump inhibitor","route":"oral","medication_type":"otc","gut_relevance":"primary","common_gut_effects":["acid suppression","bloating","microbiome shift"],"interaction_flags":["acid_suppression"],"evidence_notes":"PPI for reflux and acid-related symptoms."},
      {"generic_name":"famotidine","display_name":"Famotidine","brand_names":["Pepcid"],"rxnorm_code":null,"medication_class":"H2 blocker","route":"oral","medication_type":"otc","gut_relevance":"primary","common_gut_effects":["acid suppression"],"interaction_flags":["acid_suppression"],"evidence_notes":"H2 blocker for reflux and dyspepsia."},
      {"generic_name":"amoxicillin","display_name":"Amoxicillin","brand_names":["Amoxil"],"rxnorm_code":null,"medication_class":"antibiotic","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["diarrhea","nausea","microbiome disruption"],"interaction_flags":["microbiome_disruption"],"evidence_notes":"Broadly used oral antibiotic."},
      {"generic_name":"amoxicillin_clavulanate","display_name":"Amoxicillin-Clavulanate","brand_names":["Augmentin"],"rxnorm_code":null,"medication_class":"antibiotic","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["diarrhea","nausea","microbiome disruption"],"interaction_flags":["microbiome_disruption"],"evidence_notes":"Antibiotic with common GI side effects."},
      {"generic_name":"azithromycin","display_name":"Azithromycin","brand_names":["Zithromax"],"rxnorm_code":null,"medication_class":"antibiotic","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["diarrhea","nausea","microbiome disruption"],"interaction_flags":["microbiome_disruption"],"evidence_notes":"Macrolide antibiotic."},
      {"generic_name":"doxycycline","display_name":"Doxycycline","brand_names":[],"rxnorm_code":null,"medication_class":"antibiotic","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["nausea","diarrhea","microbiome disruption"],"interaction_flags":["microbiome_disruption"],"evidence_notes":"Tetracycline antibiotic."},
      {"generic_name":"ciprofloxacin","display_name":"Ciprofloxacin","brand_names":["Cipro"],"rxnorm_code":null,"medication_class":"antibiotic","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["diarrhea","nausea","microbiome disruption"],"interaction_flags":["microbiome_disruption"],"evidence_notes":"Fluoroquinolone antibiotic."},
      {"generic_name":"metronidazole","display_name":"Metronidazole","brand_names":["Flagyl"],"rxnorm_code":null,"medication_class":"antibiotic","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["nausea","diarrhea","microbiome disruption"],"interaction_flags":["microbiome_disruption"],"evidence_notes":"Antibiotic used in GI and pelvic infections."},
      {"generic_name":"cephalexin","display_name":"Cephalexin","brand_names":["Keflex"],"rxnorm_code":null,"medication_class":"antibiotic","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["diarrhea","nausea","microbiome disruption"],"interaction_flags":["microbiome_disruption"],"evidence_notes":"Cephalosporin antibiotic."},
      {"generic_name":"polyethylene_glycol","display_name":"Polyethylene Glycol","brand_names":["MiraLAX"],"rxnorm_code":null,"medication_class":"osmotic laxative","route":"oral","medication_type":"otc","gut_relevance":"primary","common_gut_effects":["looser stool","urgency"],"interaction_flags":["motility_speeding"],"evidence_notes":"Common osmotic laxative."},
      {"generic_name":"senna","display_name":"Senna","brand_names":["Senokot"],"rxnorm_code":null,"medication_class":"stimulant laxative","route":"oral","medication_type":"otc","gut_relevance":"primary","common_gut_effects":["looser stool","urgency"],"interaction_flags":["motility_speeding"],"evidence_notes":"Common stimulant laxative."},
      {"generic_name":"bisacodyl","display_name":"Bisacodyl","brand_names":["Dulcolax"],"rxnorm_code":null,"medication_class":"stimulant laxative","route":"oral","medication_type":"otc","gut_relevance":"primary","common_gut_effects":["looser stool","urgency"],"interaction_flags":["motility_speeding"],"evidence_notes":"Common stimulant laxative."},
      {"generic_name":"docusate_sodium","display_name":"Docusate Sodium","brand_names":["Colace"],"rxnorm_code":null,"medication_class":"stool softener","route":"oral","medication_type":"otc","gut_relevance":"primary","common_gut_effects":["softer stool"],"interaction_flags":["motility_speeding"],"evidence_notes":"Stool softener used in constipation plans."},
      {"generic_name":"loperamide","display_name":"Loperamide","brand_names":["Imodium"],"rxnorm_code":null,"medication_class":"antidiarrheal","route":"oral","medication_type":"otc","gut_relevance":"primary","common_gut_effects":["slower motility","constipation"],"interaction_flags":["motility_slowing"],"evidence_notes":"Common antidiarrheal."},
      {"generic_name":"bismuth_subsalicylate","display_name":"Bismuth Subsalicylate","brand_names":["Pepto-Bismol"],"rxnorm_code":null,"medication_class":"antidiarrheal","route":"oral","medication_type":"otc","gut_relevance":"primary","common_gut_effects":["slower motility","nausea relief"],"interaction_flags":["motility_slowing"],"evidence_notes":"Used for nausea and diarrhea symptoms."},
      {"generic_name":"ibuprofen","display_name":"Ibuprofen","brand_names":["Advil","Motrin"],"rxnorm_code":null,"medication_class":"NSAID","route":"oral","medication_type":"otc","gut_relevance":"secondary","common_gut_effects":["stomach irritation","nausea","reflux"],"interaction_flags":["reflux_risk"],"evidence_notes":"Common NSAID with upper-GI irritation risk."},
      {"generic_name":"naproxen","display_name":"Naproxen","brand_names":["Aleve"],"rxnorm_code":null,"medication_class":"NSAID","route":"oral","medication_type":"otc","gut_relevance":"secondary","common_gut_effects":["stomach irritation","nausea","reflux"],"interaction_flags":["reflux_risk"],"evidence_notes":"Common NSAID with upper-GI irritation risk."},
      {"generic_name":"metformin","display_name":"Metformin","brand_names":["Glucophage"],"rxnorm_code":null,"medication_class":"biguanide","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["diarrhea","bloating","GI upset"],"interaction_flags":["motility_speeding"],"evidence_notes":"Common diabetes medication with GI side effects."},
      {"generic_name":"magnesium_citrate","display_name":"Magnesium Citrate","brand_names":[],"rxnorm_code":null,"medication_class":"magnesium supplement","route":"oral","medication_type":"otc","gut_relevance":"primary","common_gut_effects":["looser stool","diarrhea"],"interaction_flags":["motility_speeding"],"evidence_notes":"More laxating magnesium form."},
      {"generic_name":"magnesium_oxide","display_name":"Magnesium Oxide","brand_names":[],"rxnorm_code":null,"medication_class":"magnesium supplement","route":"oral","medication_type":"otc","gut_relevance":"primary","common_gut_effects":["looser stool","diarrhea"],"interaction_flags":["motility_speeding"],"evidence_notes":"Common magnesium supplement with GI effects."},
      {"generic_name":"ferrous_sulfate","display_name":"Ferrous Sulfate","brand_names":[],"rxnorm_code":null,"medication_class":"iron supplement","route":"oral","medication_type":"otc","gut_relevance":"primary","common_gut_effects":["constipation","nausea"],"interaction_flags":["motility_slowing"],"evidence_notes":"Common oral iron formulation."},
      {"generic_name":"probiotic_blend","display_name":"Probiotic Blend","brand_names":["Align","Culturelle","Florastor"],"rxnorm_code":null,"medication_class":"probiotic","route":"oral","medication_type":"supplement","gut_relevance":"primary","common_gut_effects":["temporary bloating","gas"],"interaction_flags":["bloating_risk"],"evidence_notes":"Probiotic supplement bucket."},
      {"generic_name":"psyllium_husk","display_name":"Psyllium Husk","brand_names":["Metamucil"],"rxnorm_code":null,"medication_class":"fiber supplement","route":"oral","medication_type":"supplement","gut_relevance":"primary","common_gut_effects":["bulk increase","bloating"],"interaction_flags":["motility_speeding"],"evidence_notes":"Common soluble fiber supplement."},
      {"generic_name":"oxycodone","display_name":"Oxycodone","brand_names":["Roxicodone"],"rxnorm_code":null,"medication_class":"opioid","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["constipation","nausea"],"interaction_flags":["motility_slowing"],"evidence_notes":"Common opioid analgesic."},
      {"generic_name":"hydrocodone_acetaminophen","display_name":"Hydrocodone / Acetaminophen","brand_names":["Norco"],"rxnorm_code":null,"medication_class":"opioid","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["constipation","nausea"],"interaction_flags":["motility_slowing"],"evidence_notes":"Common opioid analgesic combination."},
      {"generic_name":"tramadol","display_name":"Tramadol","brand_names":[],"rxnorm_code":null,"medication_class":"opioid","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["constipation","nausea"],"interaction_flags":["motility_slowing"],"evidence_notes":"Common opioid-like analgesic."},
      {"generic_name":"sertraline","display_name":"Sertraline","brand_names":["Zoloft"],"rxnorm_code":null,"medication_class":"SSRI","route":"oral","medication_type":"prescription","gut_relevance":"secondary","common_gut_effects":["nausea","looser stool"],"interaction_flags":["diarrhea_risk"],"evidence_notes":"Common SSRI with GI startup effects."},
      {"generic_name":"fluoxetine","display_name":"Fluoxetine","brand_names":["Prozac"],"rxnorm_code":null,"medication_class":"SSRI","route":"oral","medication_type":"prescription","gut_relevance":"secondary","common_gut_effects":["nausea","looser stool"],"interaction_flags":["diarrhea_risk"],"evidence_notes":"Common SSRI with GI startup effects."},
      {"generic_name":"escitalopram","display_name":"Escitalopram","brand_names":["Lexapro"],"rxnorm_code":null,"medication_class":"SSRI","route":"oral","medication_type":"prescription","gut_relevance":"secondary","common_gut_effects":["nausea","looser stool"],"interaction_flags":["diarrhea_risk"],"evidence_notes":"Common SSRI with GI startup effects."},
      {"generic_name":"mesalamine","display_name":"Mesalamine","brand_names":["Lialda","Pentasa","Apriso"],"rxnorm_code":null,"medication_class":"GI anti-inflammatory","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["GI-directed treatment"],"interaction_flags":[],"evidence_notes":"IBD-directed medication."},
      {"generic_name":"budesonide","display_name":"Budesonide","brand_names":["Entocort","Uceris"],"rxnorm_code":null,"medication_class":"GI anti-inflammatory steroid","route":"oral","medication_type":"prescription","gut_relevance":"primary","common_gut_effects":["GI-directed treatment"],"interaction_flags":[],"evidence_notes":"GI-directed steroid sometimes used in inflammatory bowel conditions."}
    ]'::jsonb
  ) AS x(
    generic_name text,
    display_name text,
    brand_names text[],
    rxnorm_code text,
    medication_class text,
    route text,
    medication_type text,
    gut_relevance text,
    common_gut_effects text[],
    interaction_flags text[],
    evidence_notes text
  )
)
INSERT INTO medication_reference_items (
  generic_name,
  display_name,
  brand_names,
  rxnorm_code,
  medication_class,
  route,
  medication_type,
  gut_relevance,
  common_gut_effects,
  interaction_flags,
  evidence_notes
)
SELECT
  generic_name,
  display_name,
  brand_names,
  rxnorm_code,
  medication_class,
  route,
  medication_type,
  gut_relevance,
  common_gut_effects,
  interaction_flags,
  evidence_notes
FROM medication_seed seed
WHERE NOT EXISTS (
  SELECT 1
  FROM medication_reference_items existing
  WHERE existing.generic_name = seed.generic_name
    AND COALESCE(existing.route, '') = COALESCE(seed.route, '')
);