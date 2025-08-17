import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

// Sanitize req.body / req.params / req.query **in place**
// (Express 5 makes req.query a getter; don't reassign it)
export default function sanitize() {
  return [
    (req, _res, next) => {
      if (req.body)   mongoSanitize.sanitize(req.body,   { replaceWith: '_' });
      if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: '_' });
      if (req.query)  mongoSanitize.sanitize(req.query,  { replaceWith: '_' });
      next();
    },
    // HTTP Parameter Pollution protection
    hpp()
  ];
}