exports.up = (pgm) => {
  pgm.createTable('note_summaries', {
    id: { type: 'serial', primaryKey: true },
    skill: { type: 'varchar(255)', notNull: true },
    user_id: { type: 'varchar(255)', notNull: true },
    summary: { type: 'text', notNull: true },
    note_count: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });

  // Add unique constraint on skill and user_id combination
  pgm.addConstraint('note_summaries', 'note_summaries_skill_user_id_unique', {
    unique: ['skill', 'user_id']
  });
};

exports.down = (pgm) => {
  pgm.dropTable('note_summaries');
};
