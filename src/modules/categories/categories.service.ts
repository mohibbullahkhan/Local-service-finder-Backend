import { prisma } from '../../config/prisma';

export class CategoriesService {
  async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }
}

export const categoriesService = new CategoriesService();
