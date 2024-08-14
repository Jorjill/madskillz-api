exports.up = async (pgm) => {
    // Drop foreign key constraints before changing the column type
    const tables = ["items", "notes", "references", "topics", "questions", "specific_questions", "experience_questions"];
    tables.forEach(table => {
      pgm.dropConstraint(table, `${table}_user_id_fkey`);
    });
  
    // Alter the user_id columns in all tables to be of type varchar
    tables.forEach(table => {
      pgm.alterColumn(table, "user_id", {
        type: "varchar(255)",
        notNull: true,
        default: 'default_user', // Use default varchar value, must match an existing user_id in users table
      });
    });
  
    // Alter the user_id column in the users table
    pgm.alterColumn("users", "user_id", {
      type: "varchar(255)",
      using: "user_id::varchar", // Convert existing user_id integers to varchar
    });
  
    // Re-add foreign key constraints after changing the column type
    tables.forEach(table => {
      pgm.addConstraint(table, `${table}_user_id_fkey`, {
        foreignKeys: {
          columns: "user_id",
          references: "users(user_id)",
          onDelete: "CASCADE"
        }
      });
    });
  };
  
  exports.down = async (pgm) => {
    // Drop foreign key constraints before reverting the column type
    const tables = ["items", "notes", "references", "topics", "questions", "specific_questions", "experience_questions"];
    tables.forEach(table => {
      pgm.dropConstraint(table, `${table}_user_id_fkey`);
    });
  
    // Revert the user_id columns in all tables to be of type integer
    tables.forEach(table => {
      pgm.alterColumn(table, "user_id", {
        type: "integer",
        notNull: true,
        default: 1, // Use default integer value, must match an existing user_id in users table
      });
    });
  
    // Revert the user_id column in the users table to integer
    pgm.alterColumn("users", "user_id", {
      type: "serial",
      using: "user_id::integer", // Convert existing user_id varchar back to integer
    });
  
    // Re-add foreign key constraints after reverting the column type
    tables.forEach(table => {
      pgm.addConstraint(table, `${table}_user_id_fkey`, {
        foreignKeys: {
          columns: "user_id",
          references: "users(user_id)",
          onDelete: "CASCADE"
        }
      });
    });
  };
  