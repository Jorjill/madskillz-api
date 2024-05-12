exports.up = (pgm) => {
  // Create items table
  pgm.createTable('items', {
    id: { type: 'serial', primaryKey: true },
    title: { type: 'varchar(255)', notNull: true },
    imageurl: { type: 'varchar(255)', notNull: true, default: '' }
  });

  // Create notes table
  pgm.createTable('notes', {
    id: { type: 'serial', primaryKey: true },
    notes_title: { type: 'varchar(255)', notNull: true },
    content: { type: 'text', notNull: true },
    noteSkill: { type: 'varchar(255)', notNull: true },
    datetime: { type: 'timestamp', notNull: true },
    tags: { type: 'text[]', notNull: true }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('notes');
  pgm.dropTable('items');
};