import pool from '../config/database.config.js';

class EntitiesService {
  async findAllEntities() {
    return await pool.query('SELECT * FROM entities ORDER BY created_at ASC');
  }

  async findAllEntitiesExceptTitle(title) {
    return await pool.query('SELECT * FROM entities WHERE title != $1 ORDER BY created_at ASC', [title]);
  }

  async findEntityById(id) {
    return await pool.query('SELECT * FROM entities WHERE id = $1', [id]);
  }

  async createEntity(entityData) {
    const { title, description } = entityData;
    return await pool.query('INSERT INTO entities (title, description) VALUES ($1, $2) RETURNING *', [
      title,
      description
    ]);
  }

  async updateEntity(id, entityData) {
    const { title, description } = entityData;
    const entity = await this.findEntityById(id);
    return await pool.query('UPDATE entities SET title = $1, description = $2 WHERE id = $3 RETURNING *', [
      title ? title : entity.rows[0].title,
      description ? description : entity.rows[0].description,
      id
    ]);
  }

  async deleteEntity(id) {
    return await pool.query('DELETE FROM entities WHERE id = $1 RETURNING *', [id]);
  }

  async searchEntities(query) {
    return await pool.query('SELECT * FROM entities WHERE title ILIKE $1', [`%${query}%`]);
  }
}

export default new EntitiesService();
