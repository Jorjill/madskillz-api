exports.up = (pgm) => {
    // Add a datetime field to the Topics table
    pgm.addColumn("topics", {
      datetime: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") }
    });
  };
  
  exports.down = (pgm) => {
    // Remove the datetime field from the Topics table
    pgm.dropColumn("topics", "created_at");
  };
  