exports.up = (pgm) => {
    // Create the specific_questions table
    pgm.createTable("specific_questions", {
      id: { type: "serial", primaryKey: true },
      question: { type: "varchar(1000)", notNull: true },
      answer: { type: "text", notNull: false },
      skill: { type: "varchar(255)", notNull: false },
      datetime: { type: 'timestamp', notNull: true },
    });
  };
  
  exports.down = (pgm) => {
    // Drop the specific_questions table
    pgm.dropTable("specific_questions");
  };
  