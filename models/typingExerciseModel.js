const db = require("../db");

const typingExerciseModel = {
  // Create a new typing exercise
  async createTypingExercise(title, code, difficulty, language, skill, user_id) {
    try {
      const query = `
        INSERT INTO typing_exercises (title, code, difficulty, language, skill, user_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const values = [title, code, difficulty, language, skill, user_id];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating typing exercise:", error);
      throw error;
    }
  },

  // Get all typing exercises for a user and skill
  async getTypingExercises(user_id, skill) {
    try {
      const query = `
        SELECT * FROM typing_exercises 
        WHERE user_id = $1 AND skill = $2
        ORDER BY created_at DESC
      `;
      const values = [user_id, skill];
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error fetching typing exercises:", error);
      throw error;
    }
  },

  // Get a specific typing exercise by ID
  async getTypingExerciseById(id, user_id) {
    try {
      const query = `
        SELECT * FROM typing_exercises 
        WHERE id = $1 AND user_id = $2
      `;
      const values = [id, user_id];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching typing exercise by ID:", error);
      throw error;
    }
  },

  // Update a typing exercise
  async updateTypingExercise(id, title, code, difficulty, language, skill, user_id) {
    try {
      const query = `
        UPDATE typing_exercises 
        SET title = $2, code = $3, difficulty = $4, language = $5, skill = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $7
        RETURNING *
      `;
      const values = [id, title, code, difficulty, language, skill, user_id];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating typing exercise:", error);
      throw error;
    }
  },

  // Delete a typing exercise
  async deleteTypingExercise(id, user_id) {
    try {
      const query = `
        DELETE FROM typing_exercises 
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;
      const values = [id, user_id];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error deleting typing exercise:", error);
      throw error;
    }
  },

  // Get typing exercises count for a user and skill
  async getTypingExercisesCount(user_id, skill) {
    try {
      const query = `
        SELECT COUNT(*) as count FROM typing_exercises 
        WHERE user_id = $1 AND skill = $2
      `;
      const values = [user_id, skill];
      const result = await db.query(query, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error getting typing exercises count:", error);
      throw error;
    }
  },

  // Create default typing exercises for a new user/skill combination
  async createDefaultExercises(user_id, skill) {
    const defaultExercises = [
      {
        title: 'JavaScript Basics',
        code: `// Welcome to Typing Practice!
// Practice typing code to improve your speed and accuracy

function greetUser(name) {
  console.log("Hello, " + name + "!");
  return "Welcome to MadSkillz!";
}

const user = "Developer";
const message = greetUser(user);

// Try typing this code exactly as shown
// The cursor will guide you letter by letter
for (let i = 0; i < 3; i++) {
  console.log(\`Iteration \${i + 1}: \${message}\`);
}`,
        difficulty: 'Easy',
        language: 'JavaScript'
      },
      {
        title: 'React Component',
        code: `import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};

export default UserProfile;`,
        difficulty: 'Medium',
        language: 'React'
      },
      {
        title: 'Python Algorithm',
        code: `def binary_search(arr, target):
    """
    Perform binary search on a sorted array.
    Returns the index of target if found, -1 otherwise.
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Example usage
numbers = [1, 3, 5, 7, 9, 11, 13, 15]
target = 7
result = binary_search(numbers, target)

if result != -1:
    print(f"Target {target} found at index {result}")
else:
    print(f"Target {target} not found in array")`,
        difficulty: 'Hard',
        language: 'Python'
      }
    ];

    try {
      const createdExercises = [];
      for (const exercise of defaultExercises) {
        const created = await this.createTypingExercise(
          exercise.title,
          exercise.code,
          exercise.difficulty,
          exercise.language,
          skill,
          user_id
        );
        createdExercises.push(created);
      }
      return createdExercises;
    } catch (error) {
      console.error("Error creating default exercises:", error);
      throw error;
    }
  }
};

module.exports = typingExerciseModel;
