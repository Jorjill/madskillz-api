/* eslint-disable camelcase */

exports.up = pgm => {
  // Create quizzes table
  pgm.createTable('quizzes', {
    id: { type: 'varchar(255)', primaryKey: true },
    title: { type: 'varchar(255)', notNull: true },
    skill: { type: 'varchar(255)', notNull: true },
    user_id: { type: 'varchar(255)', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  // Create questions table
  pgm.createTable('quiz_questions', {
    id: { type: 'varchar(255)', primaryKey: true },
    quiz_id: {
      type: 'varchar(255)',
      notNull: true,
      references: '"quizzes"',
      onDelete: 'CASCADE'
    },
    title: { type: 'varchar(255)', notNull: true },
    text: { type: 'text', notNull: true },
    answer: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  // Create indexes
  pgm.createIndex('quizzes', 'skill');
  pgm.createIndex('quizzes', 'user_id');
  pgm.createIndex('quiz_questions', 'quiz_id');
};

exports.down = pgm => {
  pgm.dropTable('quiz_questions');
  pgm.dropTable('quizzes');
};
