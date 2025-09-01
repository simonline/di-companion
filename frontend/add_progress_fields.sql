-- Add progress tracking fields to profiles and startups tables

-- Add progress field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS progress jsonb DEFAULT '{
  "profile": false,
  "values": false,
  "assessment": false,
  "startup": false
}'::jsonb;

-- Add progress field to startups table
ALTER TABLE startups 
ADD COLUMN IF NOT EXISTS progress jsonb DEFAULT '{
  "startup-profile": false,
  "startup-members": false,
  "team-values": false,
  "team-contract": false,
  "team-assessment": false,
  "stakeholder-map": false,
  "interviews": false,
  "persona": false,
  "pitch-deck": false,
  "financial-plan": false
}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN profiles.progress IS 'Tracks completion status of user onboarding steps';
COMMENT ON COLUMN startups.progress IS 'Tracks completion status of startup journey steps';