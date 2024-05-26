exports.up = (pgm) => {
  // Create the Questions table
  pgm.createTable("questions", {
    id: { type: "serial", primaryKey: true },
    question: { type: "varchar(255)", notNull: true },
    answer: { type: "varchar(255)", notNull: false },
    skill: { type: "varchar(255)", notNull: false },
  });
};

exports.down = (pgm) => {
  // Drop the Questions table
  pgm.dropTable("questions");
};
