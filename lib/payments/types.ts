export type CreateOrderResult = {
  /** Provider's order id, stored on the payment row for reconciliation */
  orderId: string;
};

export interface PaymentProvider {
  name: "razorpay" | "manual";
  /** Create a provider-side order for the given amount (INR, rupees). */
  createOrder(amountInr: number, receipt: string): Promise<CreateOrderResult>;
  /** Refund a captured payment. No-op for manual payments. */
  refund(providerPaymentId: string, amountInr: number): Promise<void>;
}
