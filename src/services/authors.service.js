import pool from '../config/database.config.js';

class AuthorsService {
  async findAllAuthors() {
    return await pool.query('SELECT * FROM authors ORDER BY created_at ASC');
  }

  async findAllAuthorsExceptFullName(fullName) {
    return await pool.query('SELECT * FROM authors WHERE full_name != $1 ORDER BY created_at ASC', [fullName]);
  }

  async findAuthorById(id) {
    return await pool.query('SELECT * FROM authors WHERE id = $1', [id]);
  }

  async createAuthor(authorData) {
    const { fullName, biography } = authorData;
    return await pool.query('INSERT INTO authors (full_name, biography) VALUES ($1, $2) RETURNING *', [
      fullName,
      biography
    ]);
  }

  async updateAuthor(id, authorData) {
    const { fullName, biography } = authorData;
    const author = await this.findAuthorById(id);
    return await pool.query('UPDATE authors SET full_name = $1, biography = $2 WHERE id = $3 RETURNING *', [
      fullName ? fullName : author.rows[0].full_name,
      biography ? biography : author.rows[0].biography,
      id
    ]);
  }

  async deleteAuthor(id) {
    return await pool.query('DELETE FROM authors WHERE id = $1 RETURNING *', [id]);
  }

  async searchAuthors(query) {
    return await pool.query('SELECT * FROM authors WHERE full_name ILIKE $1', [`%${query}%`]);
  }
}

export default new AuthorsService();
