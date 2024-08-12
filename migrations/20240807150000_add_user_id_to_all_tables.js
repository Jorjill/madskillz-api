exports.up = async (pgm) => {
  // Create the users table
  pgm.createTable("users", {
    user_id: { type: "serial", primaryKey: true },
    username: { type: "varchar(255)", notNull: true, unique: true }
  });

  // Insert a default user
  pgm.sql("INSERT INTO users (user_id, username) VALUES (1, 'default_user');");

  // Add user_id column to all existing tables with a default value of 1
  const tables = ["items", "notes", "references", "topics", "questions", "specific_questions", "experience_questions"];
  tables.forEach(table => {
    pgm.addColumn(table, {
      user_id: {
        type: "integer",
        references: '"users"',
        notNull: true,
        default: 1, // Default value, must match an existing user_id in users table
        onDelete: "CASCADE"
      }
    });
  });
};

exports.down = (pgm) => {
  const tables = ["items", "notes", "references", "topics", "questions", "specific_questions", "experience_questions"];
  tables.forEach(table => {
    pgm.dropColumn(table, "user_id");
  });

  pgm.dropTable("users");
};
