-- Add answerResults column to quiz_results table
ALTER TABLE quiz_results
ADD COLUMN answer_results JSONB;

-- Update existing rows with empty array
UPDATE quiz_results
SET answer_results = '[]'::jsonb
WHERE answer_results IS NULL;
