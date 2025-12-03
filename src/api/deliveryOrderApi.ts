import apiAuth from './indexAuth';
export const getDeliveryOrder = async () => {
  console.log('apiAuthsdfasdfasdfs');

  const response = await apiAuth.get('api/deliveryOrder/getPerRider', {});
  console.log('response in rider api', response.data);
  return response.data;
};
export const editDeliveryOrder = async (id: number, status: string) => {
  console.log('apiAuthsdfasdfasdfs', id);
  const response = await apiAuth.put(`api/deliveryOrder/edit/${id}`, {
    status,
  });
  return response.data;
};
