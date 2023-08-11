import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import expressHandlebars from 'express-handlebars';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import homeController from './controllers/home.controller.js';
import booksController from './controllers/books.controller.js';
import authorsController from './controllers/authors.controller.js';
import genresController from './controllers/genres.controller.js';
import authController from './controllers/auth.controller.js';
import administratorsController from './controllers/administrators.controller.js';
import rolesController from './controllers/roles.controller.js';
import permissionsController from './controllers/permissions.controller.js';
import entitiesController from './controllers/entities.controller.js';

class App {
  constructor() {
    this.app = express();
    this.setConfig();
    this.setHandlebarsConfig();
    this.setControllers();
    this.setErrorHandlingMiddleware();
  }

  setConfig() {
    this.app.use(express.json());
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    this.app.use(cookieParser());
    this.app.use(cors());
    this.app.use('/public/index.css', express.static(path.join(process.cwd(), '/public/index.css')));
    this.app.use('/public/index.js', express.static(path.join(process.cwd(), '/public/index.js')));
    this.app.use('/uploads', express.static(path.join(process.cwd(), '/uploads')));
  }

  setHandlebarsConfig() {
    const hbs = expressHandlebars.create({
      defaultLayout: 'main',
      extname: 'hbs'
    });
    this.app.engine('hbs', hbs.engine);
    this.app.set('view engine', 'hbs');
    this.app.set('views', 'views');
  }

  setControllers() {
    this.app.use('/', homeController);
    this.app.use('/', booksController);
    this.app.use('/', authorsController);
    this.app.use('/', genresController);
    this.app.use('/', authController);
    this.app.use('/', administratorsController);
    this.app.use('/', rolesController);
    this.app.use('/', permissionsController);
    this.app.use('/', entitiesController);
  }

  setErrorHandlingMiddleware() {
    this.app.use(errorHandler);
  }
}

export default new App().app;
