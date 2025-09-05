// src/services/activityService.js
import { prisma } from '../prismaClient.js';

export const activityService = {
  createActivity: async (type, details, userId, productId = null) => {
const normalizedUserId = userId?.userId || userId;
    
    if (!normalizedUserId) {
      throw new Error('User ID is required to create an activity');
    }
    
    return await prisma.activity.create({
      data: {
        type,
        details,
        userId: parseInt(normalizedUserId),
        productId: productId ? parseInt(productId) : null,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        product: {
          select: {
            name: true,
            baseSku: true,
          },
        },
      },
    });
  },

  getAllActivities: async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
          product: {
            select: {
              name: true,
              baseSku: true,
            },
          },
        },
      }),
      prisma.activity.count(),
    ]);

    return {
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  },

  getActivitiesByProduct: async (productId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
          product: {
            select: {
              name: true,
              baseSku: true,
            },
          },
        },
      }),
      prisma.activity.count({ where: { productId } }),
    ]);

    return {
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
  },
};