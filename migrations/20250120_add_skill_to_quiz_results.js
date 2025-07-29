exports.up = (pgm) => {
  pgm.addColumn('quiz_results', {
    skill: { type: 'varchar(255)', notNull: true, default: 'general' }
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('quiz_results', 'skill');
};
