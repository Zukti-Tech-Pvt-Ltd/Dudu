import apiAuth from './indexAuth';
export const getDeliveryOrder = async () => {
  const response = await apiAuth.get('api/deliveryOrder/getPerRider', {});
  return response.data;
};
export const editDeliveryOrder = async (id: number, status: string) => {
  const response = await apiAuth.put(`api/deliveryOrder/edit/${id}`, {
    status,
  });
  return response.data;
};
