import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNewModels() {
  try {
    console.log('Testing new payment models availability...');
    
    // Test if models are accessible
    console.log('Invoice model:', typeof prisma.invoice);
    console.log('Payment model:', typeof prisma.payment);
    console.log('Refund model:', typeof prisma.refund);
    
    // Test basic operations
    const invoiceCount = await prisma.invoice.count();
    console.log('Current invoice count:', invoiceCount);
    
    const paymentCount = await prisma.payment.count();
    console.log('Current payment count:', paymentCount);
    
    const refundCount = await prisma.refund.count();
    console.log('Current refund count:', refundCount);
    
    console.log('✅ All payment models are working!');
    
  } catch (error) {
    console.error('❌ Error testing models:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewModels();
