import rolesService from '../services/roles.service.js';

function checkRolesPermissionMiddleware(roleArray, permission) {
  return async (req, res, next) => {
    try {
      const administratorOwnerRole = await rolesService.findAdministratorRolesByAdministratorIdRoleTitle(
        req.administrator.id,
        'Owner'
      );
      const administratorRoles = await rolesService.findAllAdministratorRolesByAdministratorId(req.administrator.id);
      const matchingRoles = administratorRoles.rows.filter((role) => {
        return roleArray.includes(role.title);
      });
      const roleIds = matchingRoles.map((value) => {
        return value.role_id;
      });
      const rolePermissions = await rolesService.findRolePermissionsByRolesIdsPermission(roleIds, permission);
      if (administratorOwnerRole.rows[0]) {
        res.locals.isOwner = true;
        next();
      } else if (!administratorOwnerRole.rows[0] && rolePermissions.rows.length > 0) {
        next();
      } else {
        res.redirect('/admin');
      }
    } catch (error) {
      console.log(error);
    }
  };
}

export default checkRolesPermissionMiddleware;
