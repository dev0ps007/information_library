import { Router } from 'express';
import authService from '../services/auth.service.js';
import administratorsService from '../services/administrators.service.js';
import emailsService from '../services/emails.service.js';
import redisService from '../services/redis.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';

class AuthController {
  path = '/auth';
  router = Router();

  constructor() {
    this.setRoutes();
  }

  setRoutes() {
    this.router.route(`${this.path}/login`).get(this.getAdminLogIn);
    this.router.route(`${this.path}/login`).post(this.postAdminLogIn);
    this.router.route(`${this.path}/login/2fa/email`).get(this.getLogInWithCode);
    this.router.route(`${this.path}/login/2fa/email`).post(this.postLogInWithCode);
    this.router.route(`${this.path}/login/2fa/code`).get(this.getLogInConfirmCode);
    this.router.route(`${this.path}/login/2fa/code`).post(this.postLogInConfirmCode);
    this.router.route(`${this.path}/logout`).get(authMiddleware, this.logOut);
  }

  async getAdminLogIn(req, res, next) {
    res.render('admin/auth/login', {
      title: 'LogIn page',
      layout: 'admin',
      isAdminLogIn: true
    });
  }

  async postAdminLogIn(req, res, next) {
    try {
      const candidate = await administratorsService.findAdministratorByEmail(req.body.email);
      if (candidate.rows[0]) {
        const isPasswordMatching = await authService.verifyPassword(req.body.password, candidate.rows[0].password);
        if (isPasswordMatching) {
          const cookieWithJwtToken = await authService.getCookieWithJwtToken(candidate.rows[0].id);
          res.setHeader('Set-Cookie', cookieWithJwtToken).redirect('/admin');
        } else {
          res.redirect('/');
        }
      } else {
        res.redirect('/');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getLogInWithCode(req, res, next) {
    res.render('admin/auth/loginWithCode', {
      title: 'LogIn page with code',
      layout: 'admin'
    });
  }

  async postLogInWithCode(req, res, next) {
    try {
      const candidate = await administratorsService.findAdministratorByEmail(req.body.email);
      if (candidate.rows[0]) {
        const code = Math.trunc(Math.random() * (99999 - 10000 + 1) + 10000);
        await emailsService.sendCode(candidate.rows[0].email, code);
        await redisService.setValue(`${candidate.rows[0].email}`, code, Number(process.env.CODE_EXPIRE));
        res
          .render('admin/auth/confirmCode', {
            title: 'LogIn page with code',
            layout: 'admin',
            administrator: candidate.rows[0]
          })
          .redirect('/admin/auth/login/2fa/code');
      } else {
        res.redirect('/');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getLogInConfirmCode(req, res, next) {
    res.render('admin/auth/confirmCode', {
      title: 'Confirm LogIn code',
      layout: 'admin'
    });
  }

  async postLogInConfirmCode(req, res, next) {
    try {
      const { email, code } = req.body;
      const candidate = await administratorsService.findAdministratorByEmail(email);
      const logInCode = await redisService.getValue(`${email}`);
      if (code && logInCode && Number(code) === Number(logInCode)) {
        await redisService.deleteValue(`${email}`);
        const cookieWithJwtToken = await authService.getCookieWithJwtToken(candidate.rows[0].id);
        res.setHeader('Set-Cookie', cookieWithJwtToken).redirect('/admin');
      } else {
        res.redirect('/');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async logOut(req, res, next) {
    try {
      const cookieForLogOut = await authService.getCookieForLogOut();
      res.setHeader('Set-Cookie', cookieForLogOut).redirect('/');
    } catch (error) {
      console.log(error);
    }
  }
}

export default new AuthController().router;
