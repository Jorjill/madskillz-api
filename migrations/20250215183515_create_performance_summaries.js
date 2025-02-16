exports.up = (pgm) => {
  pgm.createTable('performance_summaries', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'varchar(255)', notNull: true },
    summary: { type: 'text', notNull: true },
    last_quiz_date: { type: 'timestamp', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });

  // Add unique constraint on user_id
  pgm.addConstraint('performance_summaries', 'performance_summaries_user_id_unique', {
    unique: ['user_id']
  });
};

exports.down = (pgm) => {
  pgm.dropTable('performance_summaries');
};
