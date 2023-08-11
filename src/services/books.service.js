import pool from '../config/database.config.js';

class BooksService {
  async findAllBooks() {
    return await pool.query(
      'SELECT books.id, books.title, books.description, books.publication_date, books.author_id, books.genre_id, books.book_image, books.book_file, authors.full_name AS author_full_name, genres.title AS genre_title FROM books LEFT JOIN authors ON books.author_id = authors.id LEFT JOIN genres ON books.genre_id = genres.id ORDER BY books.created_at ASC'
    );
  }

  async findBookById(id) {
    return await pool.query(
      'SELECT books.id, books.title, books.description, books.publication_date, books.author_id, books.genre_id, books.book_image, books.book_file, authors.full_name AS author_full_name, genres.title AS genre_title FROM books LEFT JOIN authors ON books.author_id = authors.id LEFT JOIN genres ON books.genre_id = genres.id WHERE books.id = $1',
      [id]
    );
  }

  async createBook(bookData, bookImage, bookFile) {
    const { title, description, publicationDate, authorId, genreId } = bookData;
    return await pool.query(
      'INSERT INTO books (title, description, publication_date, author_id, genre_id, book_image, book_file) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, publicationDate, authorId, genreId, bookImage, bookFile]
    );
  }

  async updateBook(id, bookData, bookImage, bookFile) {
    const { title, description, publicationDate, authorId, genreId } = bookData;
    const book = await this.findBookById(id);
    return await pool.query(
      'UPDATE books SET title = $1, description = $2, publication_date = $3, author_id = $4, genre_id = $5, book_image = $6, book_file = $7 WHERE id = $8 RETURNING *',
      [
        title ? title : book.rows[0].title,
        description ? description : book.rows[0].description,
        publicationDate ? publicationDate : book.rows[0].publication_date,
        authorId ? authorId : book.rows[0].author_id,
        genreId ? genreId : book.rows[0].genre_id,
        bookImage ? bookImage : book.rows[0].book_image,
        bookFile ? bookFile : book.rows[0].book_file,
        id
      ]
    );
  }

  async deleteBook(id) {
    return await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
  }

  async searchBooks(author, genre, search) {
    return await pool.query(
      'SELECT books.id, books.title, books.description, books.publication_date, books.author_id, books.genre_id, books.book_image, books.book_file, authors.full_name AS author_full_name, genres.title AS genre_title FROM books LEFT JOIN authors ON authors.id = books.author_id LEFT JOIN genres ON books.genre_id = genres.id WHERE books.title ILIKE $1 AND authors.full_name ILIKE $2 AND genres.title ILIKE $3',
      [search ? `%${search}%` : `%${''}%`, author ? `%${author}%` : `%${''}%`, genre ? `%${genre}%` : `%${''}%`]
    );
  }
}

export default new BooksService();
