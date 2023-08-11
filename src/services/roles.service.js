import pool from '../config/database.config.js';

class RolesService {
  async findAllRoles() {
    return await pool.query('SELECT * FROM roles ORDER BY created_at ASC');
  }

  async findAllRolesExceptTitle(title) {
    return await pool.query('SELECT * FROM roles WHERE title != $1 ORDER BY created_at ASC', [title]);
  }

  async findRoleById(id) {
    return await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
  }

  async createRole(roleData) {
    const { title, description } = roleData;
    return await pool.query('INSERT INTO roles (title, description) VALUES ($1, $2) RETURNING *', [title, description]);
  }

  async updateRole(id, roleData) {
    const { title, description } = roleData;
    const role = await this.findRoleById(id);
    return await pool.query('UPDATE roles SET title = $1, description = $2 WHERE id = $3 RETURNING *', [
      title ? title : role.rows[0].title,
      description ? description : role.rows[0].description,
      id
    ]);
  }

  async deleteRole(id) {
    return await pool.query('DELETE FROM roles WHERE id = $1 RETURNING *', [id]);
  }

  async searchRoles(query) {
    return await pool.query('SELECT * FROM roles WHERE title ILIKE $1', [`%${query}%`]);
  }

  async findAllRolePermissionsByRoleId(roleId) {
    return await pool.query(
      'SELECT * FROM role_permissions LEFT JOIN permissions ON permissions.id = role_permissions.permission_id WHERE role_permissions.role_id = $1 ORDER BY role_permissions.created_at ASC',
      [roleId]
    );
  }

  async findRolePermissionsByRoleIdPermissionId(roleId, permissionId) {
    return await pool.query('SELECT * FROM role_permissions WHERE role_id = $1 AND permission_id = $2', [
      roleId,
      permissionId
    ]);
  }

  async createRolePermissions(roleId, permissionId) {
    return await pool.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) RETURNING *', [
      roleId,
      permissionId
    ]);
  }

  async deleteRolePermissionsByRoleId(roleId) {
    return await pool.query('DELETE FROM role_permissions WHERE role_id = $1 RETURNING *', [roleId]);
  }

  async deleteRolePermissionsByRoleIdPermissionId(roleId, permissionId) {
    return await pool.query('DELETE FROM role_permissions WHERE role_id = $1 AND permission_id =$2 RETURNING *', [
      roleId,
      permissionId
    ]);
  }

  async findAllAdministratorRolesByAdministratorId(administratorId) {
    return await pool.query(
      'SELECT * FROM administrator_roles LEFT JOIN roles ON roles.id = administrator_roles.role_id WHERE administrator_roles.administrator_id = $1 ORDER BY administrator_roles.created_at ASC',
      [administratorId]
    );
  }

  async findAdministratorRolesByAdministratorIdRoleId(administratorId, roleId) {
    return await pool.query('SELECT * FROM administrator_roles WHERE administrator_id = $1 AND role_id = $2', [
      administratorId,
      roleId
    ]);
  }

  async createAdministratorRoles(administratorId, roleId) {
    return await pool.query('INSERT INTO administrator_roles (administrator_id, role_id) VALUES ($1, $2) RETURNING *', [
      administratorId,
      roleId
    ]);
  }

  async deleteAdministratorRolesByRoleId(roleId) {
    return await pool.query('DELETE FROM administrator_roles WHERE administrator_id = $1 RETURNING *', [roleId]);
  }

  async deleteAdministratorRolesByAdministratorIdRoleId(administratorId, roleId) {
    return await pool.query('DELETE FROM administrator_roles WHERE administrator_id =$1 AND role_id = $2 RETURNING *', [
      administratorId,
      roleId
    ]);
  }

  async findAdministratorRolesByAdministratorIdRoleTitle(id, title) {
    return await pool.query(
      'SELECT * FROM administrator_roles LEFT JOIN roles ON roles.id = administrator_roles.role_id WHERE administrator_roles.administrator_id = $1 AND roles.title = $2',
      [id, title]
    );
  }

  async findRolePermissionsByRolesIdsPermission(roleIds, permission) {
    return await pool.query(
      'SELECT * FROM role_permissions LEFT JOIN permissions ON permissions.id = role_permissions.permission_id WHERE role_id = ANY($1) AND permissions.title = $2',
      [roleIds, permission]
    );
  }

  async findRolePermissionsByRoleIds(roleIds) {
    return await pool.query(
      'SELECT * FROM role_permissions LEFT JOIN permissions ON permissions.id = role_permissions.permission_id WHERE role_id = ANY($1)',
      [roleIds]
    );
  }
}

export default new RolesService();
