exports.up = (pgm) => {
  // Create the Questions table
  pgm.createTable("questions", {
    id: { type: "serial", primaryKey: true },
    question: { type: "varchar(1000)", notNull: true },
    answer: { type: "text", notNull: false },
    skill: { type: "varchar(255)", notNull: false },
    datetime: { type: 'timestamp', notNull: true },
  });
};

exports.down = (pgm) => {
  // Drop the Questions table
  pgm.dropTable("questions");
};
