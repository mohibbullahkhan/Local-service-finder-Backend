import { Request, Response } from 'express';
import { usersService } from './users.service';
import { sendSuccess } from '../../utils/apiResponse';

export class UsersController {
  getMe = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const user = await usersService.getMe(userId);
    return sendSuccess(res, user, 200);
  };

  updateMe = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const user = await usersService.updateUser(userId, req.body);
    return sendSuccess(res, user, 200);
  };
}

export const usersController = new UsersController();
