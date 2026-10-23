import { OrderDetails } from "@/components/orders/order-details";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({
  params,
}: OrderPageProps) {
  const { id } = await params;

  return <OrderDetails orderId={id} />;
}
