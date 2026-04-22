alter table public.hydration_logs
  add column if not exists beverage_category text,
  add column if not exists caffeine_mg integer,
  add column if not exists effective_hydration_ml integer,
  add column if not exists water_goal_contribution_ml integer,
  add column if not exists electrolyte_present boolean,
  add column if not exists alcohol_present boolean;

comment on column public.hydration_logs.amount_ml
  is 'Raw total fluid intake in milliliters.';

comment on column public.hydration_logs.effective_hydration_ml
  is 'Modeled hydration contribution used for hydration analysis.';

comment on column public.hydration_logs.water_goal_contribution_ml
  is 'Strict water-goal contribution used for water-goal progress.';

comment on column public.hydration_logs.caffeine_mg
  is 'Estimated caffeine exposure for this beverage entry.';
