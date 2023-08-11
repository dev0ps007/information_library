import { Router } from 'express';
import authorsService from '../services/authors.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import checkRolesPermissionMiddleware from '../middlewares/administrators.middleware.js';

class AuthorsController {
  path = '/authors';
  router = Router();

  constructor() {
    this.setRoutes();
  }

  setRoutes() {
    this.router.route(`${this.path}`).get(this.getAuthors);
    this.router
      .route(`/admin${this.path}`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'ReadAuthor'), this.getAdminAuthors);
    this.router
      .route(`/admin${this.path}/new`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'ReadAuthor'), this.getAddAuthor);
    this.router
      .route(`/admin${this.path}/new`)
      .post(
        authMiddleware,
        checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'CreateAuthor'),
        this.postAddAuthor
      );
    this.router
      .route(`/admin${this.path}/:id/edit`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'ReadAuthor'), this.getEditAuthor);
    this.router
      .route(`/admin${this.path}/:id/edit`)
      .post(
        authMiddleware,
        checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'UpdateAuthor'),
        this.postEditAuthor
      );
    this.router
      .route(`/admin${this.path}/:id/delete`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'DeleteAuthor'), this.deleteAuthor);
  }

  async getAuthors(req, res, next) {
    try {
      const { search } = req.query;
      let authors;
      if (search) {
        authors = await authorsService.searchAuthors(search);
      } else {
        authors = await authorsService.findAllAuthors();
      }
      res.render('authors', {
        title: 'Authors page',
        isAuthors: true,
        authors: authors.rows,
        search
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAdminAuthors(req, res, next) {
    try {
      const { search } = req.query;
      let authors;
      if (search) {
        authors = await authorsService.searchAuthors(search);
      } else {
        authors = await authorsService.findAllAuthors();
      }
      res.render('admin/authors', {
        title: 'Authors page',
        isAdminAuthors: true,
        authors: authors.rows,
        search
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAddAuthor(req, res, next) {
    try {
      res.render('admin/addAuthor', {
        title: 'Author add page',
        isAdminAddAuthors: true
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postAddAuthor(req, res, next) {
    try {
      const newAuthor = await authorsService.createAuthor(req.body);
      if (newAuthor.rows[0]) {
        res.redirect('/admin/authors');
      } else {
        res.redirect('/admin/authors/new');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getEditAuthor(req, res, next) {
    try {
      const author = await authorsService.findAuthorById(req.params.id);
      res.render('admin/editAuthor', {
        title: 'Author edit page',
        author: author.rows[0]
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postEditAuthor(req, res, next) {
    try {
      const updatedAuthor = await authorsService.updateAuthor(req.params.id, req.body);
      if (updatedAuthor.rows[0]) {
        res.redirect('/admin/authors');
      } else {
        res.redirect(`/admin/authors/${req.params.id}/edit`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteAuthor(req, res, next) {
    try {
      const deletedAuthor = await authorsService.deleteAuthor(req.params.id);
      if (deletedAuthor.rows[0]) {
        res.redirect('/admin/authors');
      } else {
        res.redirect('/admin/authors');
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default new AuthorsController().router;
