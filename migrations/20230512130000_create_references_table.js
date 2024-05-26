exports.up = (pgm) => {
  // Create the References table
  pgm.createTable("references", {
    id: { type: "serial", primaryKey: true },
    skill: { type: "varchar(255)", notNull: true },
  });

  // Create the Topics table
  pgm.createTable("topics", {
    id: { type: "serial", primaryKey: true },
    title: { type: "varchar(255)", notNull: true },
    content: { type: "text", notNull: true },
    reference_id: {
      type: "integer",
      notNull: true,
      references: '"references"',
      onDelete: "CASCADE",
    },
  });
};

exports.down = (pgm) => {
  // Drop the Topics table first because of the foreign key constraint
  pgm.dropTable("topics");
  // Then drop the References table
  pgm.dropTable("references");
};
