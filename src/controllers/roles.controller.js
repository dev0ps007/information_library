import { Router } from 'express';
import rolesService from '../services/roles.service.js';
import permissionsService from '../services/permissions.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import checkRolesPermissionMiddleware from '../middlewares/administrators.middleware.js';
import entitiesService from '../services/entities.service.js';

class RolesController {
  path = '/roles';
  router = Router();

  constructor() {
    this.setRoutes();
  }

  setRoutes() {
    this.router
      .route(`/admin${this.path}`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'ReadRole'), this.getAdminRoles);
    this.router
      .route(`/admin${this.path}/new`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'CreateRole'), this.getAddRole);
    this.router
      .route(`/admin${this.path}/new`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'CreateRole'), this.postAddRole);
    this.router
      .route(`/admin${this.path}/:id/edit`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'UpdateRole'), this.getEditRole);
    this.router
      .route(`/admin${this.path}/:id/edit`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'UpdateRole'), this.postEditRole);
    this.router
      .route(`/admin${this.path}/:id/delete`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'ReadRole'), this.deleteRole);
  }

  async getAdminRoles(req, res, next) {
    try {
      const { search } = req.query;
      let roles;
      if (search) {
        roles = await rolesService.searchRoles(search);
      } else {
        roles = await rolesService.findAllRoles();
      }
      res.render('admin/roles', {
        title: 'Roles page',
        isAdminRoles: true,
        roles: roles.rows,
        search
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAddRole(req, res, next) {
    try {
      const permissions = await permissionsService.findAllPermissions();
      const entities = await entitiesService.findAllEntities();
      let entitiesPermissions = [];
      for (const [entityIndex, entityObj] of entities.rows.entries()) {
        const filteredPermissions = permissions.rows.filter((permission) => {
          return permission.entity_id === entityObj.id;
        });
        let newGroupPermissions = {
          entityName: entityObj.title,
          permissions: []
        };
        newGroupPermissions.permissions.length = 4;
        for (const [permissionIndex, permissionObj] of filteredPermissions.entries()) {
          if (permissionObj.title.includes('Read')) {
            newGroupPermissions.permissions[0] = permissionObj;
          } else if (permissionObj.title.includes('Create')) {
            newGroupPermissions.permissions[1] = permissionObj;
          } else if (permissionObj.title.includes('Update')) {
            newGroupPermissions.permissions[2] = permissionObj;
          } else if (permissionObj.title.includes('Delete')) {
            newGroupPermissions.permissions[3] = permissionObj;
          }
        }
        for (const [permissionIndex, permissionObj] of newGroupPermissions.permissions.entries()) {
          if (newGroupPermissions.permissions[permissionIndex] === undefined && permissionIndex === 0) {
            newGroupPermissions.permissions[permissionIndex] = { id: null, title: 'Read' };
          } else if (newGroupPermissions.permissions[permissionIndex] === undefined && permissionIndex === 1) {
            newGroupPermissions.permissions[permissionIndex] = { id: null, title: 'Create' };
          } else if (newGroupPermissions.permissions[permissionIndex] === undefined && permissionIndex === 2) {
            newGroupPermissions.permissions[permissionIndex] = { id: null, title: 'Update' };
          } else if (newGroupPermissions.permissions[permissionIndex] === undefined && permissionIndex === 3) {
            newGroupPermissions.permissions[permissionIndex] = { id: null, title: 'Delete' };
          }
        }
        entitiesPermissions.push(newGroupPermissions);
      }
      res.render('admin/addRole', {
        title: 'Role add page',
        isAdminAddRoles: true,
        entitiesPermissions
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postAddRole(req, res, next) {
    try {
      const { permission } = req.body;
      const newRole = await rolesService.createRole(req.body);
      if (newRole.rows[0]) {
        if (permission && Array.isArray(permission)) {
          for (let i = 0; i < permission.length; i++) {
            await rolesService.createRolePermissions(newRole.rows[0].id, permission[i]);
          }
        } else if (permission && !Array.isArray(permission)) {
          await rolesService.createRolePermissions(newRole.rows[0].id, permission);
        }
        res.redirect('/admin/roles');
      } else {
        res.redirect('/admin/roles/new');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getEditRole(req, res, next) {
    try {
      const rolePermissions = await rolesService.findAllRolePermissionsByRoleId(req.params.id);
      const permissionIds = rolePermissions.rows.map((rolePermission) => {
        return rolePermission.permission_id;
      });
      const permissions = await permissionsService.findAllPermissions();
      const filteredPermissions = permissions.rows.filter((permission) => {
        if (!permissionIds.includes(permission.id)) {
          return permission;
        }
      });
      const entities = await entitiesService.findAllEntities();
      let permissionsList = [...rolePermissions.rows, ...filteredPermissions];
      let entitiesPermissions = [];
      for (const [entityIndex, entityObj] of entities.rows.entries()) {
        const filteredPermissions = permissionsList.filter((permission) => {
          return permission.entity_id === entityObj.id;
        });
        let newGroupPermissions = {
          entityName: entityObj.title,
          permissions: []
        };
        newGroupPermissions.permissions.length = 4;
        for (const [permissionIndex, permissionObj] of filteredPermissions.entries()) {
          if (permissionObj.title.includes('Read')) {
            newGroupPermissions.permissions[0] = permissionObj;
          } else if (permissionObj.title.includes('Create')) {
            newGroupPermissions.permissions[1] = permissionObj;
          } else if (permissionObj.title.includes('Update')) {
            newGroupPermissions.permissions[2] = permissionObj;
          } else if (permissionObj.title.includes('Delete')) {
            newGroupPermissions.permissions[3] = permissionObj;
          }
        }
        for (const [permissionIndex, permissionObj] of newGroupPermissions.permissions.entries()) {
          if (newGroupPermissions.permissions[permissionIndex] === undefined && permissionIndex === 0) {
            newGroupPermissions.permissions[permissionIndex] = { id: null, title: 'Read' };
          } else if (newGroupPermissions.permissions[permissionIndex] === undefined && permissionIndex === 1) {
            newGroupPermissions.permissions[permissionIndex] = { id: null, title: 'Create' };
          } else if (newGroupPermissions.permissions[permissionIndex] === undefined && permissionIndex === 2) {
            newGroupPermissions.permissions[permissionIndex] = { id: null, title: 'Update' };
          } else if (newGroupPermissions.permissions[permissionIndex] === undefined && permissionIndex === 3) {
            newGroupPermissions.permissions[permissionIndex] = { id: null, title: 'Delete' };
          }
        }
        entitiesPermissions.push(newGroupPermissions);
      }
      const role = await rolesService.findRoleById(req.params.id);
      res.render('admin/editRole', {
        title: 'Role edit page',
        role: role.rows[0],
        rolePermissions: rolePermissions.rows,
        entitiesPermissions
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postEditRole(req, res, next) {
    try {
      const { permission } = req.body;
      const updatedRole = await rolesService.updateRole(req.params.id, req.body);
      if (updatedRole.rows[0]) {
        if (permission && Array.isArray(permission)) {
          const parsedPermissions = permission.map((permission) => {
            return parseInt(permission);
          });
          const permissions = await permissionsService.findAllPermissions();
          const filteredPermissions = permissions.rows.filter((permission) => {
            if (!parsedPermissions.includes(permission.id)) {
              return permission;
            }
          });
          for (let i = 0; i < filteredPermissions.length; i++) {
            await rolesService.deleteRolePermissionsByRoleIdPermissionId(
              updatedRole.rows[0].id,
              filteredPermissions[i].id
            );
          }
        } else if (permission && !Array.isArray(permission)) {
          const parsedPermission = parseInt(permission);
          const permissions = await permissionsService.findAllPermissions();
          const filteredPermissions = permissions.rows.filter((permission) => {
            if (parsedPermission !== permission.id) {
              return permission;
            }
          });
          for (let i = 0; i < filteredPermissions.length; i++) {
            await rolesService.deleteRolePermissionsByRoleIdPermissionId(
              updatedRole.rows[0].id,
              filteredPermissions[i].id
            );
          }
        }
        if (permission && Array.isArray(permission)) {
          for (let i = 0; i < permission.length; i++) {
            const rolePermission = await rolesService.findRolePermissionsByRoleIdPermissionId(
              updatedRole.rows[0].id,
              permission[i]
            );
            if (!rolePermission.rows[0]) {
              await rolesService.createRolePermissions(updatedRole.rows[0].id, permission[i]);
            }
          }
        } else if (permission && !Array.isArray(permission)) {
          const rolePermission = await rolesService.findRolePermissionsByRoleIdPermissionId(
            updatedRole.rows[0].id,
            permission
          );
          if (!rolePermission.rows[0]) {
            await rolesService.createRolePermissions(updatedRole.rows[0].id, permission);
          }
        } else if (!permission) {
          await rolesService.deleteRolePermissionsByRoleId(updatedRole.rows[0].id);
        }
        res.redirect('/admin/roles');
      } else {
        res.redirect(`/admin/roles/${req.params.id}/edit`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteRole(req, res, next) {
    try {
      const deletedRole = await rolesService.deleteRole(req.params.id);
      if (deletedRole.rows[0]) {
        res.redirect('/admin/roles');
      } else {
        res.redirect('/admin/roles');
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default new RolesController().router;
