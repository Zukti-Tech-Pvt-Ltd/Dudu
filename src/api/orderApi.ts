import apiAuth from './indexAuth';

interface OrderItemPayload {
  price: number;
  quantity: number;
  productId: number;
}
interface CreateOrderPayload {
  status: string;
  price: number;
  deliveryAddress: string;
  estimatedDeliveryDate: string;
  orderItems: OrderItemPayload[];
}
export const createOrder = async (payload: CreateOrderPayload) => {
  console.log('payload', payload);
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
    console.log('r1111111111111112121212121212esponse00000', response);
    return response.data.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
