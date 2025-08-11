exports.up = (pgm) => {
  // Create typing_exercises table
  pgm.createTable('typing_exercises', {
    id: { type: 'serial', primaryKey: true },
    title: { type: 'varchar(255)', notNull: true },
    code: { type: 'text', notNull: true },
    difficulty: { type: 'varchar(50)', notNull: true, check: "difficulty IN ('Easy', 'Medium', 'Hard')" },
    language: { type: 'varchar(100)', notNull: true },
    skill: { type: 'varchar(255)', notNull: true },
    user_id: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  // Create index on user_id and skill for faster queries
  pgm.createIndex('typing_exercises', 'user_id');
  pgm.createIndex('typing_exercises', 'skill');
  pgm.createIndex('typing_exercises', ['user_id', 'skill']);
};

exports.down = (pgm) => {
  pgm.dropTable('typing_exercises');
};
