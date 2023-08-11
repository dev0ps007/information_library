import { Router } from 'express';
import genresService from '../services/genres.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import checkRolesPermissionMiddleware from '../middlewares/administrators.middleware.js';

class GenresController {
  path = '/genres';
  router = Router();

  constructor() {
    this.setRoutes();
  }

  setRoutes() {
    this.router.route(`${this.path}`).get(this.getGenres);
    this.router
      .route(`/admin${this.path}`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'ReadGenre'), this.getAdminGenres);
    this.router
      .route(`/admin${this.path}/new`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'ReadGenre'), this.getAddGenre);
    this.router
      .route(`/admin${this.path}/new`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'CreateGenre'), this.postAddGenre);
    this.router
      .route(`/admin${this.path}/:id/edit`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'ReadGenre'), this.getEditGenre);
    this.router
      .route(`/admin${this.path}/:id/edit`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'UpdateGenre'), this.postEditGenre);
    this.router
      .route(`/admin${this.path}/:id/delete`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'DeleteGenre'), this.deleteGenre);
  }

  async getGenres(req, res, next) {
    try {
      const { search } = req.query;
      let genres;
      if (search) {
        genres = await genresService.searchGenres(search);
      } else {
        genres = await genresService.findAllGenres();
      }
      res.render('genres', {
        title: 'Genres page',
        isGenres: true,
        genres: genres.rows,
        search
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAdminGenres(req, res, next) {
    try {
      const { search } = req.query;
      let genres;
      if (search) {
        genres = await genresService.searchGenres(search);
      } else {
        genres = await genresService.findAllGenres();
      }
      res.render('admin/genres', {
        title: 'Genres page',
        isAdminGenres: true,
        genres: genres.rows,
        search
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAddGenre(req, res, next) {
    try {
      res.render('admin/addGenre', {
        title: 'Genre add page',
        isAdminAddGenres: true
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postAddGenre(req, res, next) {
    try {
      const newGenre = await genresService.createGenre(req.body);
      if (newGenre.rows[0]) {
        res.redirect('/admin/genres');
      } else {
        res.redirect('/admin/genres/new');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getEditGenre(req, res, next) {
    try {
      const genre = await genresService.findGenreById(req.params.id);
      res.render('admin/editGenre', {
        title: 'Genre edit page',
        genre: genre.rows[0]
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postEditGenre(req, res, next) {
    try {
      const updatedGenre = await genresService.updateGenre(req.params.id, req.body);
      if (updatedGenre.rows[0]) {
        res.redirect('/admin/genres');
      } else {
        res.redirect(`/admin/genres/${req.params.id}/edit`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteGenre(req, res, next) {
    try {
      const deletedGenre = await genresService.deleteGenre(req.params.id);
      if (deletedGenre.rows[0]) {
        res.redirect('/admin/genres');
      } else {
        res.redirect('/admin/genres');
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default new GenresController().router;
