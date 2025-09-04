import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/prisma';

interface NotificationSettings {
  emailBookingConfirmations: boolean;
  emailBookingReminders: boolean;
  emailPromotionalOffers: boolean;
  smsBookingConfirmations: boolean;
  smsBookingReminders: boolean;
}

// GET /api/user/settings - Get user settings
async function getSettings(req: NextRequest, userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        language: true,
        timezone: true,
        // Default notification settings for now
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Default notification settings (would be stored in database in production)
    const defaultNotifications: NotificationSettings = {
      emailBookingConfirmations: true,
      emailBookingReminders: true,
      emailPromotionalOffers: false,
      smsBookingConfirmations: false,
      smsBookingReminders: false,
    };

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          language: user.language || 'da',
          timezone: user.timezone || 'Europe/Copenhagen',
        },
        notifications: defaultNotifications,
      },
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/settings - Update user settings
async function updateSettings(req: NextRequest, userId: string) {
  try {
    const body = await req.json();
    const { notifications, language, timezone } = body;

    // For now, just update basic user settings
    // Notification settings would be stored in a separate table in production
    const updateData: any = {};
    
    if (language) {
      updateData.language = language;
    }
    
    if (timezone) {
      updateData.timezone = timezone;
    }

    let user = null;
    if (Object.keys(updateData).length > 0) {
      user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          language: true,
          timezone: true,
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          language: true,
          timezone: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // In production, you would also update notification settings in database
    // For now, we just acknowledge the update
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          language: user.language || 'da',
          timezone: user.timezone || 'Europe/Copenhagen',
        },
        notifications: notifications || {},
      },
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getSettings);
export const PATCH = withAuth(updateSettings);
