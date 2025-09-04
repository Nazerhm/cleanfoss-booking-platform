# Feature 006: Payment Processing Models

## 🎯 Feature Goal
Implement comprehensive payment processing system that handles invoicing, payments, VAT calculations, and integrates with Danish payment providers (MobilePay, Dankort, etc.) to complete the booking-to-payment workflow.

## 📋 Acceptance Criteria
- [ ] Invoice generation with proper Danish VAT handling (25%)
- [ ] Payment processing with multiple payment methods
- [ ] MobilePay integration for mobile payments
- [ ] Payment status tracking and reconciliation
- [ ] Refund and partial payment support
- [ ] Multi-tenant payment isolation
- [ ] Automated invoice numbering per company
- [ ] Payment confirmation and receipt generation

## ✅ Definition of Done
- Payment models created and migrated to database
- Invoice generation working with Danish VAT calculations
- Payment method integration framework established
- Payment status workflow implemented
- Multi-tenant payment data isolation verified
- Comprehensive test coverage for all payment scenarios
- Integration tests with existing booking system
- Documentation for payment processing workflows

## 📝 Context Notes
> Feature started: September 2, 2025

### 2025-09-02
* Building on completed booking engine (Task 005)
* Focus on Danish market requirements (DKK currency, 25% VAT)
* Integration with existing booking totals and revenue splits
* Need to handle agent commission payments separately from customer payments

## 🔍 Decisions Log
| Date (YYYY-MM-DD) | Context / Question | Decision | Status |
|-------------------|--------------------|----------|--------|
| 2025-09-02 | Payment method priorities | Start with MobilePay (most popular in Denmark) + card payments | Decided |
| 2025-09-02 | VAT handling approach | Apply 25% Danish VAT to all services, store gross + net amounts | Decided |
| 2025-09-02 | Invoice numbering | Company-specific sequential numbering (COMP001-INV-001) | Decided |

## 📝 Scratch Notes
*Key considerations for Danish market:*
- MobilePay is dominant mobile payment method
- 25% VAT standard rate for services
- Invoice requirements: VAT number, clear line items
- Revenue split: Customer pays full amount, company splits with agent later
