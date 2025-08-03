exports.up = (pgm) => {
  // Check if column exists first to make migration idempotent
  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name='quiz_results' AND column_name='skill') THEN
        ALTER TABLE "quiz_results" ADD COLUMN "skill" varchar(255) DEFAULT 'general' NOT NULL;
      END IF;
    END
    $$;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn('quiz_results', 'skill');
};
