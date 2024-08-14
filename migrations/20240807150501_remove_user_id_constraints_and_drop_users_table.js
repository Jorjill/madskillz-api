exports.up = async (pgm) => {
    // List of tables from which to remove foreign key constraints related to user_id
    const tables = ["items", "notes", "references", "topics", "questions", "specific_questions", "experience_questions"];
    
    // Drop foreign key constraints for user_id in each table
    tables.forEach(table => {
      pgm.dropConstraint(table, `${table}_user_id_fkey`, { ifExists: true });
    });
  
    // Drop the users table
    pgm.dropTable("users", { ifExists: true });
  };
  
  exports.down = async (pgm) => {
    // This is the reversal of the above migration.
    // Recreate the users table
    pgm.createTable("users", {
      user_id: { type: "serial", primaryKey: true },
      username: { type: "varchar(255)", notNull: true, unique: true }
    });
  
    // Re-add foreign key constraints to each table without adding back the user_id column (assuming columns still exist)
    const tables = ["items", "notes", "references", "topics", "questions", "specific_questions", "experience_questions"];
    tables.forEach(table => {
      // Add back the foreign key constraints
      pgm.addConstraint(table, `${table}_user_id_fkey`, {
        foreignKeys: {
          columns: "user_id",
          references: "users(user_id)",
          onDelete: "CASCADE"
        }
      });
    });
  };
  