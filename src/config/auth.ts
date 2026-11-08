import path from 'path';

/**
 * Where the logged-in session (cookies) is saved by tests/auth.setup.ts.
 * The folder is git-ignored (/playwright/.auth/ in .gitignore).
 */
export const AUTH_FILE = path.join(__dirname, '..', '..', 'playwright', '.auth', 'user.json');
