import { Request, Response } from 'express';
import { providersService } from './providers.service';
import { sendSuccess } from '../../utils/apiResponse';

export class ProvidersController {
  listProviders = async (req: Request, res: Response) => {
    const result = await providersService.listProviders(req.query as any);
    return sendSuccess(res, result);
  };

  getProviderById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (id === 'me') {
      return this.getOwnProfile(req, res);
    }
    const provider = await providersService.getProviderById(id);
    return sendSuccess(res, provider);
  };

  createOwnProfile = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await providersService.createOwnProfile(userId, req.body);
    return sendSuccess(res, profile, 201);
  };

  getOwnProfile = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await providersService.getOwnProfile(userId);
    return sendSuccess(res, profile);
  };

  updateOwnProfile = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await providersService.updateOwnProfile(userId, req.body);
    return sendSuccess(res, profile);
  };

  addService = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const service = await providersService.addService(userId, req.body);
    return sendSuccess(res, service, 201);
  };

  updateService = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const service = await providersService.updateService(userId, id, req.body);
    return sendSuccess(res, service);
  };

  deleteService = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const result = await providersService.deleteService(userId, id);
    return sendSuccess(res, result);
  };

  addPhoto = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const isCover = req.body.isCover === 'true' || req.body.isCover === true;
    const photo = await providersService.addPhoto(
      userId,
      { url: req.body.url, isCover },
      req.file
    );
    return sendSuccess(res, photo, 201);
  };

  deletePhoto = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const result = await providersService.deletePhoto(userId, id);
    return sendSuccess(res, result);
  };

  requestVerification = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await providersService.requestVerification(userId);
    return sendSuccess(res, profile);
  };
}

export const providersController = new ProvidersController();
