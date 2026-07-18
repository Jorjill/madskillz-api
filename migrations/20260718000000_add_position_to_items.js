exports.up = (pgm) => {
  pgm.addColumn('items', {
    position: { type: 'integer', notNull: false, default: null }
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('items', 'position');
};
