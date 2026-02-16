import apiAuth from './indexAuth';

interface OrderItemPayload {
  price: number;
  quantity: number;
  productId: number;
}
interface CreateOrderPayload {
  status: string;
  // price: number;
  deliveryAddress: string;
  estimatedDeliveryDate: string;
  orderItems: OrderItemPayload[];
}
export const createOrder = async (payload: CreateOrderPayload) => {
  const response = await apiAuth.post('api/order/create', payload);

  return response.data;
};

export const editOrder = async (id: number, payload: CreateOrderPayload) => {
  const response = await apiAuth.post(`api/payment/edit/${id}`, {
    payload,
  });
  return response.data;
};

export const getAllOrders = async (status: string) => {
  try {
    const response = await apiAuth.get(`api/order/getAll`, {
      params: { status },
    });
    return response.data.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
export const getAllOrderToday = async () => {
  try {
    const response = await apiAuth.get(`api/order/getAllOrderToday`);
    return response.data.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
export const orderReceivedByUser = async (orderId: number) => {
  try {
    const response = await apiAuth.get(
      `api/order/orderReceivedByUser/${orderId}`,
    );
    return response.data.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
