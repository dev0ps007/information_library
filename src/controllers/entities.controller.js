import { Router } from 'express';
import entitiesService from '../services/entities.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import checkRolesPermissionMiddleware from '../middlewares/administrators.middleware.js';

class EntitiesController {
  path = '/entities';
  router = Router();

  constructor() {
    this.setRoutes();
  }

  setRoutes() {
    this.router
      .route(`/admin${this.path}`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'ReadEntity'), this.getAdminEntities);
    this.router
      .route(`/admin${this.path}/new`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'ReadEntity'), this.getAddEntity);
    this.router
      .route(`/admin${this.path}/new`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'CreateEntity'), this.postAddEntity);
    this.router
      .route(`/admin${this.path}/:id/edit`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'ReadEntity'), this.getEditEntity);
    this.router
      .route(`/admin${this.path}/:id/edit`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'UpdateEntity'), this.postEditEntity);
    this.router
      .route(`/admin${this.path}/:id/delete`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Owner'], 'DeleteEntity'), this.deleteEntity);
  }

  async getAdminEntities(req, res, next) {
    try {
      const { search } = req.query;
      let entities;
      if (search) {
        entities = await entitiesService.searchEntities(search);
      } else {
        entities = await entitiesService.findAllEntities();
      }
      res.render('admin/entities', {
        title: 'Entities page',
        isAdminEntities: true,
        entities: entities.rows,
        search
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAddEntity(req, res, next) {
    try {
      res.render('admin/addEntity', {
        title: 'Entity add page',
        isAdminAddEntities: true
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postAddEntity(req, res, next) {
    try {
      const newEntity = await entitiesService.createEntity(req.body);
      if (newEntity.rows[0]) {
        res.redirect('/admin/entities');
      } else {
        res.redirect('/admin/entities/new');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getEditEntity(req, res, next) {
    try {
      const entity = await entitiesService.findEntityById(req.params.id);
      res.render('admin/editEntity', {
        title: 'Entity edit page',
        entity: entity.rows[0]
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postEditEntity(req, res, next) {
    try {
      const updatedEntity = await entitiesService.updateEntity(req.params.id, req.body);
      if (updatedEntity.rows[0]) {
        res.redirect('/admin/entities');
      } else {
        res.redirect(`/admin/entities/${req.params.id}/edit`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteEntity(req, res, next) {
    try {
      const deletedEntity = await entitiesService.deleteEntity(req.params.id);
      if (deletedEntity.rows[0]) {
        res.redirect('/admin/entities');
      } else {
        res.redirect('/admin/entities');
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default new EntitiesController().router;
