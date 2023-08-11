import { Router } from 'express';
import administratorsService from '../services/administrators.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authService from '../services/auth.service.js';
import rolesService from '../services/roles.service.js';
import permissionsService from '../services/permissions.service.js';
import checkRolesPermissionMiddleware from '../middlewares/administrators.middleware.js';
import entitiesService from '../services/entities.service.js';

class AdministratorsController {
  path = '/administrators';
  router = Router();

  constructor() {
    this.setRoutes();
  }

  setRoutes() {
    this.router
      .route(`/admin${this.path}`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'ReadAdministrator'), this.getAdminAdministrators);
    this.router
      .route(`/admin${this.path}/new`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'CreateAdministrator'), this.getAddAdministrator);
    this.router
      .route(`/admin${this.path}/new`)
      .post(
        authMiddleware,
        checkRolesPermissionMiddleware(['Owner'], 'CreateAdministrator'),
        this.postAddAdministrator
      );
    this.router
      .route(`/admin${this.path}/:id/edit`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'UpdateAdministrator'), this.getEditAdministrator);
    this.router
      .route(`/admin${this.path}/:id/edit`)
      .post(
        authMiddleware,
        checkRolesPermissionMiddleware(['Owner'], 'UpdateAdministrator'),
        this.postEditAdministrator
      );
    this.router
      .route(`/admin${this.path}/:id/delete`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'DeleteAdministrator'), this.deleteAdministrator);
    this.router
      .route(`/admin/profile`)
      .get(
        authMiddleware,
        checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'ReadProfile'),
        this.getAdminProfile
      );
    this.router.route(`/admin/profile/edit`).post(authMiddleware, this.postEditAdministratorProfile);
    this.router.route(`/admin/profile/password/edit`).post(authMiddleware, this.postEditAdministratorPassword);
  }

  async getAdminAdministrators(req, res, next) {
    try {
      const { search } = req.query;
      let administrators;
      if (search) {
        administrators = await administratorsService.searchAdministrators(search);
      } else {
        administrators = await administratorsService.findAllAdministrators();
      }
      res.render('admin/administrators', {
        title: 'Administrators page',
        isAdminAdministrators: true,
        administrators: administrators.rows,
        search
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAddAdministrator(req, res, next) {
    try {
      const roles = await rolesService.findAllRolesExceptTitle('Owner');
      res.render('admin/addAdministrator', {
        title: 'Administrator add page',
        isAdminAddAdministrators: true,
        roles: roles.rows
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postAddAdministrator(req, res, next) {
    try {
      const { password, passwordConfirm, role } = req.body;
      if (password === passwordConfirm) {
        const hashedPassword = await authService.hashPassword(password, 10);
        const newAdministrator = await administratorsService.createAdministrator(req.body, hashedPassword);
        if (newAdministrator.rows[0]) {
          if (role && Array.isArray(role)) {
            for (let i = 0; i < role.length; i++) {
              await rolesService.createAdministratorRoles(newAdministrator.rows[0].id, role[i]);
            }
          } else if (role && !Array.isArray(role)) {
            await rolesService.createAdministratorRoles(newAdministrator.rows[0].id, role);
          }
          res.redirect('/admin/administrators');
        } else {
          res.redirect('/admin/administrators/new');
        }
      } else {
        res.redirect('/admin/administrators/new');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getEditAdministrator(req, res, next) {
    try {
      const administratorRoles = await rolesService.findAllAdministratorRolesByAdministratorId(req.params.id);
      const roleIds = administratorRoles.rows.map((administratorRole) => {
        return administratorRole.role_id;
      });
      const roles = await rolesService.findAllRolesExceptTitle('Owner');
      const administrator = await administratorsService.findAdministratorById(req.params.id);
      res.render('admin/editAdministrator', {
        title: 'Administrator edit page',
        administrator: administrator.rows[0],
        administratorRoles: administratorRoles.rows,
        roles: roles.rows.filter((role) => {
          if (!roleIds.includes(role.id)) {
            return role;
          }
        })
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postEditAdministrator(req, res, next) {
    try {
      const { password, passwordConfirm, role } = req.body;
      if (password && passwordConfirm && password === passwordConfirm) {
        const hashedPassword = await authService.hashPassword(password, 10);
        const updatedAdministrator = await administratorsService.updateAdministrator(
          req.params.id,
          req.body,
          hashedPassword
        );
        if (updatedAdministrator.rows[0]) {
          if (role && Array.isArray(role)) {
            const parsedRoleIds = role.map((value) => {
              return parseInt(value);
            });
            const roles = await rolesService.findAllRolesExceptTitle('Owner');
            const filteredRoles = roles.rows.filter((role) => {
              if (!parsedRoleIds.includes(role.id)) {
                return role;
              }
            });
            for (let i = 0; i < filteredRoles.length; i++) {
              await rolesService.deleteAdministratorRolesByAdministratorIdRoleId(
                updatedAdministrator.rows[0].id,
                filteredRoles[i].id
              );
            }
          } else if (role && !Array.isArray(role)) {
            const parsedRoleId = parseInt(role);
            const roles = await rolesService.findAllRolesExceptTitle('Owner');
            const filteredRoles = roles.rows.filter((role) => {
              if (parsedRoleId !== role.id) {
                return role;
              }
            });
            for (let i = 0; i < filteredRoles.length; i++) {
              await rolesService.deleteAdministratorRolesByAdministratorIdRoleId(
                updatedAdministrator.rows[0].id,
                filteredRoles[i].id
              );
            }
          }
          if (role && Array.isArray(role)) {
            for (let i = 0; i < role.length; i++) {
              const administratorRole = await rolesService.findAdministratorRolesByAdministratorIdRoleId(
                updatedAdministrator.rows[0].id,
                role[i]
              );
              if (!administratorRole.rows[0]) {
                await rolesService.createAdministratorRoles(updatedAdministrator.rows[0].id, role[i]);
              }
            }
          } else if (role && !Array.isArray(role)) {
            const administratorRole = await rolesService.findAdministratorRolesByAdministratorIdRoleId(
              updatedAdministrator.rows[0].id,
              role
            );
            if (!administratorRole.rows[0]) {
              await rolesService.createAdministratorRoles(updatedAdministrator.rows[0].id, role);
            }
          } else if (!role) {
            await rolesService.deleteAdministratorRolesByRoleId(updatedAdministrator.rows[0].id);
          }
          res.redirect('/admin/administrators');
        } else {
          res.redirect(`/admin/administrators/${req.params.id}/edit`);
        }
      } else if (!password && !passwordConfirm) {
        const updatedAdministrator = await administratorsService.updateAdministrator(req.params.id, req.body, null);
        if (updatedAdministrator.rows[0]) {
          if (role && Array.isArray(role)) {
            const parsedRoleIds = role.map((value) => {
              return parseInt(value);
            });
            const roles = await rolesService.findAllRolesExceptTitle('Owner');
            const filteredRoles = roles.rows.filter((role) => {
              if (!parsedRoleIds.includes(role.id)) {
                return role;
              }
            });
            for (let i = 0; i < filteredRoles.length; i++) {
              await rolesService.deleteAdministratorRolesByAdministratorIdRoleId(
                updatedAdministrator.rows[0].id,
                filteredRoles[i].id
              );
            }
          } else if (role && !Array.isArray(role)) {
            const parsedRoleId = parseInt(role);
            const roles = await rolesService.findAllRolesExceptTitle('Owner');
            const filteredRoles = roles.rows.filter((role) => {
              if (parsedRoleId !== role.id) {
                return role;
              }
            });
            for (let i = 0; i < filteredRoles.length; i++) {
              await rolesService.deleteAdministratorRolesByAdministratorIdRoleId(
                updatedAdministrator.rows[0].id,
                filteredRoles[i].id
              );
            }
          }
          if (role && Array.isArray(role)) {
            for (let i = 0; i < role.length; i++) {
              const administratorRole = await rolesService.findAdministratorRolesByAdministratorIdRoleId(
                updatedAdministrator.rows[0].id,
                role[i]
              );
              if (!administratorRole.rows[0]) {
                await rolesService.createAdministratorRoles(updatedAdministrator.rows[0].id, role[i]);
              }
            }
          } else if (role && !Array.isArray(role)) {
            const administratorRole = await rolesService.findAdministratorRolesByAdministratorIdRoleId(
              updatedAdministrator.rows[0].id,
              role
            );
            if (!administratorRole.rows[0]) {
              await rolesService.createAdministratorRoles(updatedAdministrator.rows[0].id, role);
            }
          } else if (!role) {
            await rolesService.deleteAdministratorRolesByRoleId(updatedAdministrator.rows[0].id);
          }
          res.redirect('/admin/administrators');
        } else {
          res.redirect(`/admin/administrators/${req.params.id}/edit`);
        }
      } else {
        res.redirect(`/admin/administrators/${req.params.id}/edit`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteAdministrator(req, res, next) {
    try {
      const deletedAdministrator = await administratorsService.deleteAdministrator(req.params.id);
      if (deletedAdministrator.rows[0]) {
        res.redirect('/admin/administrators');
      } else {
        res.redirect('/admin/administrators');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getAdminProfile(req, res, next) {
    const administratorRoles = await rolesService.findAllAdministratorRolesByAdministratorId(req.administrator.id);
    const roleIds = administratorRoles.rows.map((administratorRole) => {
      return administratorRole.role_id;
    });
    const rolePermissions = await rolesService.findRolePermissionsByRoleIds(roleIds);
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
    res.render('admin/profile', {
      title: 'Profile page',
      administrator: req.administrator,
      administratorRoles: administratorRoles.rows,
      entitiesPermissions
    });
  }

  async postEditAdministratorProfile(req, res, next) {
    try {
      const updatedAdministrator = await administratorsService.updateAdministrator(req.administrator.id, req.body);
      if (updatedAdministrator.rows[0]) {
        res.redirect('/admin');
      } else {
        res.redirect('/admin/profile');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async postEditAdministratorPassword(req, res, next) {
    try {
      const { oldPassword, newPassword, newPasswordConfirm } = req.body;
      if (oldPassword) {
        const isPasswordMatching = await authService.verifyPassword(oldPassword, req.administrator.password);
        if (isPasswordMatching && newPassword === newPasswordConfirm) {
          const hashedPassword = await authService.hashPassword(newPassword, 10);
          const updatedAdministrator = await administratorsService.updateAdministratorPassword(
            req.administrator.id,
            hashedPassword
          );
          if (updatedAdministrator.rows[0]) {
            res.redirect('/admin');
          } else {
            res.redirect('/admin/profile');
          }
        } else {
          res.redirect('/admin/profile');
        }
      } else {
        if (newPassword === newPasswordConfirm) {
          const hashedPassword = await authService.hashPassword(newPassword, 10);
          const updatedAdministrator = await administratorsService.updateAdministratorPassword(
            req.administrator.id,
            hashedPassword
          );
          if (updatedAdministrator) {
            res.redirect('/admin');
          }
        } else {
          res.redirect('/admin/profile');
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default new AdministratorsController().router;
