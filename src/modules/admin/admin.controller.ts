import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { sendSuccess } from '../../utils/apiResponse';

export class AdminController {
  getVerifications = async (req: Request, res: Response) => {
    const status = req.query.status as any;
    const verifications = await adminService.getVerifications(status);
    return sendSuccess(res, verifications);
  };

  updateVerification = async (req: Request, res: Response) => {
    const providerId = req.params.providerId as string;
    const result = await adminService.updateVerification(providerId, req.body);
    return sendSuccess(res, result);
  };

  getStats = async (req: Request, res: Response) => {
    const stats = await adminService.getStats();
    return sendSuccess(res, stats);
  };

  createCategory = async (req: Request, res: Response) => {
    const category = await adminService.createCategory(req.body);
    return sendSuccess(res, category, 201);
  };

  updateCategory = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = await adminService.updateCategory(id, req.body);
    return sendSuccess(res, category);
  };
}

export const adminController = new AdminController();
