import pool from '../config/database.config.js';

class AdministratorsService {
  async findAllAdministrators() {
    return await pool.query('SELECT * FROM administrators ORDER BY created_at ASC');
  }

  async findAdministratorById(id) {
    return await pool.query('SELECT * FROM administrators WHERE id = $1', [id]);
  }

  async findAdministratorByEmail(email) {
    return await pool.query('SELECT * FROM administrators WHERE email = $1', [email]);
  }

  async createAdministrator(administratorData, hashPassword) {
    const { email, userName, firstName, lastName } = administratorData;
    return await pool.query(
      'INSERT INTO administrators (email, user_name, first_name, last_name, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, userName, firstName, lastName, hashPassword]
    );
  }

  async updateAdministrator(id, administratorData, hashPassword) {
    const { email, userName, firstName, lastName } = administratorData;
    const administrator = await this.findAdministratorById(id);
    return await pool.query(
      'UPDATE administrators SET email = $1, user_name = $2, first_name = $3, last_name = $4, password =$5 WHERE id = $6 RETURNING *',
      [
        email ? email : administrator.rows[0].email,
        userName ? userName : administrator.rows[0].user_name,
        firstName ? firstName : administrator.rows[0].first_name,
        lastName ? lastName : administrator.rows[0].last_name,
        hashPassword ? hashPassword : administrator.rows[0].password,
        id
      ]
    );
  }

  async deleteAdministrator(id) {
    return await pool.query('DELETE FROM administrators WHERE id = $1 RETURNING *', [id]);
  }

  async searchAdministrators(query) {
    return await pool.query('SELECT * FROM administrators WHERE user_name ILIKE $1', [`%${query}%`]);
  }

  async updateAdministratorPassword(id, hashPassword) {
    return await pool.query('UPDATE administrators SET password = $1 WHERE id = $2 RETURNING *', [hashPassword, id]);
  }
}

export default new AdministratorsService();
