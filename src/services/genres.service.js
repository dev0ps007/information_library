import pool from '../config/database.config.js';

class GenresService {
  async findAllGenres() {
    return await pool.query('SELECT * FROM genres ORDER BY created_at ASC');
  }

  async findAllGenresExceptTitle(title) {
    return await pool.query('SELECT * FROM genres WHERE title != $1 ORDER BY created_at ASC', [title]);
  }

  async findGenreById(id) {
    return await pool.query('SELECT * FROM genres WHERE id = $1', [id]);
  }

  async createGenre(genreData) {
    const { title, description } = genreData;
    return await pool.query('INSERT INTO genres (title, description) VALUES ($1, $2) RETURNING *', [
      title,
      description
    ]);
  }

  async updateGenre(id, genreData) {
    const { title, description } = genreData;
    const genre = await this.findGenreById(id);
    return await pool.query('UPDATE genres SET title = $1, description = $2 WHERE id = $3 RETURNING *', [
      title ? title : genre.rows[0].title,
      description ? description : genre.rows[0].description,
      id
    ]);
  }

  async deleteGenre(id) {
    return await pool.query('DELETE FROM genres WHERE id = $1 RETURNING *', [id]);
  }

  async searchGenres(query) {
    return await pool.query('SELECT * FROM genres WHERE title ILIKE $1', [`%${query}%`]);
  }
}

export default new GenresService();
