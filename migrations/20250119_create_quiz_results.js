exports.up = (pgm) => {
  pgm.createTable('quiz_results', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'text', notNull: true },
    quiz_name: { type: 'varchar(255)', notNull: true },
    status: { type: 'varchar(50)', notNull: true },
    correct_answers: { type: 'integer', notNull: true },
    total_questions: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('quiz_results');
};
