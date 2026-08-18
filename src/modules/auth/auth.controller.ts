import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/apiResponse';

export class AuthController {
  register = async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    return sendSuccess(res, result, 201);
  };

  login = async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    return sendSuccess(res, result, 200);
  };

  refresh = async (req: Request, res: Response) => {
    const result = await authService.refresh(req.body);
    return sendSuccess(res, result, 200);
  };

  logout = async (req: Request, res: Response) => {
    const result = await authService.logout(req.body);
    return sendSuccess(res, result, 200);
  };

  getMe = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const user = await authService.getCurrentUser(userId);
    return sendSuccess(res, user, 200);
  };

  resetPassword = async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body);
    return sendSuccess(res, result, 200);
  };
}

export const authController = new AuthController();
