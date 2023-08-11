import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import booksService from '../services/books.service.js';
import authorsService from '../services/authors.service.js';
import genresService from '../services/genres.service.js';
import upload from '../services/files.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import checkRolesPermissionMiddleware from '../middlewares/administrators.middleware.js';
import formattedDate from '../utils/formattedDate.utils.js';

class BooksController {
  path = '/books';
  router = Router();

  constructor() {
    this.setRoutes();
  }

  setRoutes() {
    this.router.route(`${this.path}`).get(this.getBooks);
    this.router
      .route(`/admin${this.path}`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'ReadBook'), this.getAdminBooks);
    this.router
      .route(`/admin${this.path}/new`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'ReadBook'), this.getAddBook);
    this.router.route(`/admin${this.path}/new`).post(
      authMiddleware,
      checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'CreateBook'),
      upload.fields([
        { name: 'bookImage', maxCount: 1 },
        { name: 'bookFile', maxCount: 1 }
      ]),
      this.postAddBook
    );
    this.router
      .route(`/admin${this.path}/:id/edit`)
      .get(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'ReadBook'), this.getEditBook);
    this.router.route(`/admin${this.path}/:id/edit`).post(
      authMiddleware,
      checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'UpdateBook'),
      upload.fields([
        { name: 'bookImage', maxCount: 1 },
        { name: 'bookFile', maxCount: 1 }
      ]),
      this.postEditBook
    );
    this.router
      .route(`/admin${this.path}/:id/delete`)
      .post(authMiddleware, checkRolesPermissionMiddleware(['Admin', 'SuperAdmin'], 'DeleteBook'), this.deleteBook);
    this.router.route(`${this.path}/dowload/:file`).get(this.downloadBook);
  }

  async getBooks(req, res, next) {
    try {
      const { author, genre, search } = req.query;
      let books, authors, genres;

      if (author || genre || search) {
        books = await booksService.searchBooks(author, genre, search);
      } else {
        books = await booksService.findAllBooks();
      }

      if (author) {
        authors = await authorsService.findAllAuthorsExceptFullName(author);
      } else {
        authors = await authorsService.findAllAuthors();
      }

      if (genre) {
        genres = await genresService.findAllGenresExceptTitle(genre);
      } else {
        genres = await genresService.findAllGenres();
      }
      res.render('books', {
        title: 'Books page',
        isBooks: true,
        books: books.rows
          ? books.rows.map(
              ({
                id,
                author_full_name,
                genre_title,
                title,
                description,
                publication_date,
                author_id,
                genre_id,
                book_image,
                book_file,
                created_at,
                updated_at
              }) => ({
                id,
                author_full_name,
                genre_title,
                title,
                description,
                publication_date: formattedDate(publication_date),
                author_id,
                genre_id,
                book_image,
                book_file: book_file ? book_file.split('/')[2] : book_file,
                created_at,
                updated_at
              })
            )
          : books.rows,
        authors: authors.rows,
        genres: genres.rows,
        author,
        genre,
        search
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAdminBooks(req, res, next) {
    try {
      const { author, genre, search } = req.query;
      let books, authors, genres;

      if (author || genre || search) {
        books = await booksService.searchBooks(author, genre, search);
      } else {
        books = await booksService.findAllBooks();
      }

      if (author) {
        authors = await authorsService.findAllAuthorsExceptFullName(author);
      } else {
        authors = await authorsService.findAllAuthors();
      }

      if (genre) {
        genres = await genresService.findAllGenresExceptTitle(genre);
      } else {
        genres = await genresService.findAllGenres();
      }
      res.render('admin/books', {
        title: 'Books page',
        isAdminBooks: true,
        books: books.rows
          ? books.rows.map(
              ({
                id,
                author_full_name,
                genre_title,
                title,
                description,
                publication_date,
                author_id,
                genre_id,
                book_image,
                book_file,
                created_at,
                updated_at
              }) => ({
                id,
                author_full_name,
                genre_title,
                title,
                description,
                publication_date: formattedDate(publication_date),
                author_id,
                genre_id,
                book_image,
                book_file: book_file ? book_file.split('/')[2] : book_file,
                created_at,
                updated_at
              })
            )
          : books.rows,
        authors: authors.rows,
        genres: genres.rows,
        author,
        genre,
        search
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAddBook(req, res, next) {
    try {
      const authors = await authorsService.findAllAuthors();
      const genres = await genresService.findAllGenres();
      res.render('admin/addBook', {
        title: 'Book add page',
        isAdminAddBooks: true,
        authors: authors.rows,
        genres: genres.rows
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postAddBook(req, res, next) {
    try {
      const newBook = await booksService.createBook(
        req.body,
        req.files['bookImage'] ? req.files['bookImage'][0].path : null,
        req.files['bookFile'] ? req.files['bookFile'][0].path : null
      );
      if (newBook.rows[0]) {
        res.redirect('/admin/books');
      } else {
        res.redirect('/admin/books/new');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getEditBook(req, res, next) {
    try {
      const book = await booksService.findBookById(req.params.id);
      const authors = await authorsService.findAllAuthorsExceptFullName(book.rows[0].author_full_name);
      const genres = await genresService.findAllGenresExceptTitle(book.rows[0].genre_title);
      res.render('admin/editBook', {
        title: 'Book edit page',
        book: { ...book.rows[0], publication_date: formattedDate(book.rows[0].publication_date) },
        authors: authors.rows,
        genres: genres.rows
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postEditBook(req, res, next) {
    try {
      const updatedBook = await booksService.updateBook(
        req.params.id,
        req.body,
        req.files['bookImage'] ? req.files['bookImage'][0].path : null,
        req.files['bookFile'] ? req.files['bookFile'][0].path : null
      );
      if (updatedBook.rows[0]) {
        res.redirect('/admin/books');
      } else {
        res.redirect(`/admin/books/${req.params.id}/edit`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteBook(req, res, next) {
    try {
      const deletedBook = await booksService.deleteBook(req.params.id);
      if (deletedBook.rows[0]) {
        res.redirect('/admin/books');
      } else {
        res.redirect('/admin/books');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async downloadBook(req, res, next) {
    try {
      const filePath = path.join(process.cwd(), '/uploads/booksFiles', req.params.file);
      const fileStream = fs.createReadStream(filePath);

      fileStream.on('open', () => {
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename="${req.params.file}"`);
        fileStream.pipe(res);
      });

      fileStream.on('error', (err) => {
        console.error('Error reading the file:', err);
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default new BooksController().router;
