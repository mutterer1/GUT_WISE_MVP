/*
  # Add Additional Performance Indexes

  ## Overview
  This migration adds composite and specialized indexes to optimize common query patterns
  across all health tracking tables for improved application performance.

  ## Indexes Added

  ### Composite Indexes for Multi-Column Queries
  These indexes optimize queries that filter by user and date ranges simultaneously:
  
  1. **Time-Series Queries**
     - Composite (user_id, logged_at/sleep_start) indexes on all log tables
     - Enables efficient date-range queries per user
     - Supports dashboard and chart data retrieval
  
  2. **Filtering Indexes**
     - Symptom type filtering with user isolation
     - Meal type filtering for dietary analysis
     - Medication name lookup per user
  
  3. **Status Tracking**
     - Unread insights for notification systems
     - Pending/processing reports for background job monitoring

  ### GIN Indexes for JSONB and Array Columns
  These indexes enable efficient queries on structured and multi-value data:
  
  1. **JSONB Indexes**
     - food_items in food_logs (search ingredients)
     - metadata in insight_snapshots (search insight data)
     - content in reports (search report data)
     - filters in reports (query by applied filters)
  
  2. **Array Indexes**
     - tags in food_logs (find by dietary tags)
     - triggers in symptom_logs and stress_logs (find by trigger)
     - side_effects in medication_logs (search adverse effects)

  ### Partial Indexes
  Specialized indexes for specific filtered queries:
  
  1. **Active/Unread Data**
     - Unread insights (is_read = false)
     - Active reports (status IN pending/processing)
  
  2. **Data Quality**
     - Non-null optional fields for validation queries

  ## Performance Benefits
  
  1. **Faster Dashboard Loads**
     - User-specific date-range queries optimized
     - Recent data retrieval accelerated
  
  2. **Efficient Search**
     - Full-text search on arrays and JSONB
     - Tag-based filtering without table scans
  
  3. **Background Processing**
     - Quick lookup of pending work items
     - Efficient notification queries

  ## Notes
  - GIN indexes use more storage but dramatically improve JSONB/array queries
  - Composite indexes follow (user_id, timestamp DESC) pattern for optimal sorting
  - Partial indexes reduce size by indexing only relevant subsets
  - All indexes are created with IF NOT EXISTS for migration safety
*/

-- GIN indexes for JSONB columns (enables efficient searching within JSON structures)
CREATE INDEX IF NOT EXISTS idx_food_logs_food_items_gin ON food_logs USING GIN (food_items);
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_metadata_gin ON insight_snapshots USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_data_sources_gin ON insight_snapshots USING GIN (data_sources);
CREATE INDEX IF NOT EXISTS idx_reports_content_gin ON reports USING GIN (content);
CREATE INDEX IF NOT EXISTS idx_reports_filters_gin ON reports USING GIN (filters);

-- GIN indexes for array columns (enables efficient searching within arrays)
CREATE INDEX IF NOT EXISTS idx_food_logs_tags_gin ON food_logs USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_triggers_gin ON symptom_logs USING GIN (triggers);
CREATE INDEX IF NOT EXISTS idx_stress_logs_triggers_gin ON stress_logs USING GIN (triggers);
CREATE INDEX IF NOT EXISTS idx_stress_logs_coping_methods_gin ON stress_logs USING GIN (coping_methods);
CREATE INDEX IF NOT EXISTS idx_stress_logs_physical_symptoms_gin ON stress_logs USING GIN (physical_symptoms);
CREATE INDEX IF NOT EXISTS idx_medication_logs_side_effects_gin ON medication_logs USING GIN (side_effects);

-- Composite indexes for common query patterns (user + time range queries)
CREATE INDEX IF NOT EXISTS idx_bm_logs_user_bristol ON bm_logs(user_id, bristol_type) WHERE bristol_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bm_logs_user_pain ON bm_logs(user_id, pain_level) WHERE pain_level > 0;
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_type_logged ON symptom_logs(user_id, symptom_type, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_severity ON symptom_logs(user_id, severity DESC, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_meal_logged ON food_logs(user_id, meal_type, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_quality ON sleep_logs(user_id, quality) WHERE quality IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stress_logs_user_level ON stress_logs(user_id, stress_level DESC, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_caffeine ON hydration_logs(user_id, logged_at DESC) WHERE caffeine_content = true;
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_type ON medication_logs(user_id, medication_type, logged_at DESC);

-- Partial indexes for filtered queries (smaller, more efficient indexes)
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_unread ON insight_snapshots(user_id, created_at DESC) WHERE is_read = false AND is_dismissed = false;
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_critical ON insight_snapshots(user_id, created_at DESC) WHERE severity = 'critical';
CREATE INDEX IF NOT EXISTS idx_reports_active ON reports(user_id, created_at DESC) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_reports_completed ON reports(user_id, generated_at DESC) WHERE status = 'completed';

-- Date range indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_date_range ON insight_snapshots(user_id, date_range_start, date_range_end);
CREATE INDEX IF NOT EXISTS idx_reports_date_range ON reports(user_id, date_range_start, date_range_end);

-- Index on profile for quick user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);