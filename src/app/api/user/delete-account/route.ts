import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password-utils';

// DELETE /api/user/delete-account - Delete user account
async function deleteUserAccount(req: NextRequest, userId: string) {
  try {
    const body = await req.json();
    const { password, confirmation } = body;

    if (!password || !confirmation) {
      return NextResponse.json(
        { success: false, message: 'Password and confirmation are required' },
        { status: 400 }
      );
    }

    if (confirmation !== 'SLET MIN KONTO') {
      return NextResponse.json(
        { success: false, message: 'Invalid confirmation text' },
        { status: 400 }
      );
    }

    // Get user with password for verification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'Cannot verify password' },
        { status: 400 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Use transaction to delete all related data
    await prisma.$transaction(async (tx) => {
      // Delete user's payments
      await tx.payment.deleteMany({
        where: {
          booking: {
            customerId: userId,
          },
        },
      });

      // Delete user's booking services
      await tx.bookingService.deleteMany({
        where: {
          booking: {
            customerId: userId,
          },
        },
      });

      // Delete user's bookings
      await tx.booking.deleteMany({
        where: { customerId: userId },
      });

      // Delete user's vehicles
      await tx.customerVehicle.deleteMany({
        where: { customerId: userId },
      });

      // Delete user's sessions
      await tx.session.deleteMany({
        where: { userId: userId },
      });

      // Delete user's accounts (OAuth)
      await tx.account.deleteMany({
        where: { userId: userId },
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    
    // Check for specific database constraint errors
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json(
          { success: false, message: 'Cannot delete account due to existing dependencies. Please contact support.' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

export const DELETE = withAuth(deleteUserAccount);
