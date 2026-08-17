import { Request, Response } from 'express';
import { inquiriesService } from './inquiries.service';
import { sendSuccess } from '../../utils/apiResponse';

export class InquiriesController {
  createInquiry = async (req: Request, res: Response) => {
    const buyerId = req.user!.id;
    const inquiry = await inquiriesService.createInquiry(buyerId, req.body);
    return sendSuccess(res, inquiry, 201);
  };

  getSentInquiries = async (req: Request, res: Response) => {
    const buyerId = req.user!.id;
    const status = req.query.status as any;
    const inquiries = await inquiriesService.getSentInquiries(buyerId, status);
    return sendSuccess(res, inquiries);
  };

  getReceivedInquiries = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const status = req.query.status as any;
    const inquiries = await inquiriesService.getReceivedInquiries(userId, status);
    return sendSuccess(res, inquiries);
  };

  updateStatus = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const inquiryId = req.params.id as string;
    const inquiry = await inquiriesService.updateInquiryStatus(userId, inquiryId, req.body);
    return sendSuccess(res, inquiry);
  };
}

export const inquiriesController = new InquiriesController();
