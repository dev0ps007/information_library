import { Router } from 'express';
import permissionsService from '../services/permissions.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import checkRolesPermissionMiddleware from '../middlewares/administrators.middleware.js';
import entitiesService from '../services/entities.service.js';

class PermissionsController {
  path = '/permissions';
  router = Router();

  constructor() {
    this.setRoutes();
  }

  setRoutes() {
    this.router
      .route(`/admin${this.path}`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'ReadPermission'), this.getAdminPermissions);
    this.router
      .route(`/admin${this.path}/new`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'CreatePermission'), this.getAddPermission);
    this.router
      .route(`/admin${this.path}/new`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'CreatePermission'), this.postAddPermission);
    this.router
      .route(`/admin${this.path}/:id/edit`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'UpdatePermission'), this.getEditPermission);
    this.router
      .route(`/admin${this.path}/:id/edit`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'UpdatePermission'), this.postEditPermission);
    this.router
      .route(`/admin${this.path}/:id/delete`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'ReadPermission'), this.deletePermission);
  }

  async getAdminPermissions(req, res, next) {
    try {
      const { search } = req.query;
      let permissions;
      if (search) {
        permissions = await permissionsService.searchPermissions(search);
      } else {
        permissions = await permissionsService.findAllPermissions();
      }
      res.render('admin/permissions', {
        title: 'Permissions page',
        isAdminPermissions: true,
        permissions: permissions.rows,
        search
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAddPermission(req, res, next) {
    try {
      const entities = await entitiesService.findAllEntities();
      res.render('admin/addPermission', {
        title: 'Permission add page',
        isAdminAddPermissions: true,
        entities: entities.rows
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postAddPermission(req, res, next) {
    try {
      const newPermission = await permissionsService.createPermission(req.body);
      if (newPermission.rows[0]) {
        res.redirect('/admin/permissions');
      } else {
        res.redirect('/admin/permissions/new');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getEditPermission(req, res, next) {
    try {
      const permission = await permissionsService.findPermissionById(req.params.id);
      const entities = await entitiesService.findAllEntitiesExceptTitle(permission.rows[0].entity_title);
      res.render('admin/editPermission', {
        title: 'Permission edit page',
        permission: permission.rows[0],
        entities: entities.rows
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postEditPermission(req, res, next) {
    try {
      const updatedPermission = await permissionsService.updatePermission(req.params.id, req.body);
      if (updatedPermission.rows[0]) {
        res.redirect('/admin/permissions');
      } else {
        res.redirect(`/admin/permissions/${req.params.id}/edit`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deletePermission(req, res, next) {
    try {
      const deletedPermission = await permissionsService.deletePermission(req.params.id);
      if (deletedPermission.rows[0]) {
        res.redirect('/admin/permissions');
      } else {
        res.redirect('/admin/permissions');
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default new PermissionsController().router;
