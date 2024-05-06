exports.up = (pgm) => {
    pgm.createTable('items', {
      id: 'id',
      title: { type: 'varchar(255)', notNull: true },
      imageurl: { type: 'varchar(255)', notNull: true, default: '' }
    });
  };
  
  exports.down = (pgm) => {
    pgm.dropTable('items');
  };
  