import pool from '../config/database.config.js';
import entitiesService from './entities.service.js';

class PermissionsService {
  async findAllPermissions() {
    return await pool.query('SELECT * FROM permissions ORDER BY created_at ASC');
  }

  async findPermissionById(id) {
    return await pool.query(
      'SELECT permissions.id, permissions.title, permissions.description, permissions.entity_id, entities.title AS entity_title, entities.description AS entity_description FROM permissions LEFT JOIN entities ON entities.id = permissions.entity_id WHERE permissions.id = $1',
      [id]
    );
  }

  async createPermission(permissionData) {
    const { title, description, entityId } = permissionData;
    return await pool.query('INSERT INTO permissions (title, description, entity_id) VALUES ($1, $2, $3) RETURNING *', [
      title,
      description,
      entityId
    ]);
  }

  async updatePermission(id, permissionData) {
    const { title, description, entityId } = permissionData;
    const permission = await this.findPermissionById(id);
    return await pool.query(
      'UPDATE permissions SET title = $1, description = $2, entity_id = $3 WHERE id = $4 RETURNING *',
      [
        title ? title : permission.rows[0].title,
        description ? description : permission.rows[0].description,
        entityId ? entityId : permission.rows[0].entity_id,
        id
      ]
    );
  }

  async deletePermission(id) {
    return await pool.query('DELETE FROM permissions WHERE id = $1 RETURNING *', [id]);
  }

  async searchPermissions(query) {
    return await pool.query('SELECT * FROM permissions WHERE title ILIKE $1', [`%${query}%`]);
  }
}

export default new PermissionsService();
