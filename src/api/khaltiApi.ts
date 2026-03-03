import api from '.';

export const khaltiPayment = async (
  selectedItems: { id: string; quantity: number; price: number }[],
  userId?: number,
  totalPrice?: number,
  orderId?: number[],
) => {
  //   const selectedItemsParam = encodeURIComponent(JSON.stringify(selectedItems));

  console.log('========selectedItems', selectedItems);
  console.log('=========userId', userId);
  const response = await api.post(`/api/khalti/initiate`, {
    userId,
    selectedItems,
    totalPrice,
    orderId,
  });
  console.log('=========userId', userId);

  return response.data;
};



export const khaltiTopUpPayment = async (
  userId?: number,
  totalPrice?: number,
  deviceToken?: string | null,
) => {
  //   const selectedItemsParam = encodeURIComponent(JSON.stringify(selectedItems));

  console.log('=========userId', userId);
  const response = await api.post(`/api/khalti/topUp/initiate`, {
    userId,
    totalPrice,
    deviceToken,
  });
  console.log('=========userId', userId);

  return response.data;
};
