export function errorHandler(req, res, next) {
  res.render('404', {
    title: 'Page not found'
  });
}
