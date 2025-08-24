import apiAuth from './indexAuth';

interface OrderItemPayload {
  userId: number;
  quantity: number;
  productId: number;
}
interface CreateOrderPayload {
  status: string;
  price: number;
  estimatedDeliveryDate: string;
  orderItems: OrderItemPayload[];
}

export const createOrder = async (
  payload: CreateOrderPayload,
) => {
  const response = await apiAuth.post('api/order/create', 
    payload
  );
  return response.data;
};

export const getAllOrders = async () => {
  try {
    const response = await apiAuth.get(`api/order/getAll`);
    return response.data.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
