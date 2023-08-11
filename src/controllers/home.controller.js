import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import checkRolesPermissionMiddleware from '../middlewares/administrators.middleware.js';

class HomeController {
  path = '/';
  router = Router();

  constructor() {
    this.setRoutes();
  }

  setRoutes() {
    this.router.route(`${this.path}`).get(this.getHome);
    this.router
      .route(`${this.path}admin`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Admin, SuperAdmin'], 'ReadHome'), this.getAdminHome);
  }

  async getHome(req, res) {
    res.render('home', {
      title: 'Home page',
      isHome: true
    });
  }

  async getAdminHome(req, res) {
    res.render('admin/home', {
      title: 'Admin Home page',
      isAdminHome: true
    });
  }
}

export default new HomeController().router;
