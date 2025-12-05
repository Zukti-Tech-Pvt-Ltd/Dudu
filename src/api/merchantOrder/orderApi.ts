import apiAuth from '../indexAuth';

export const getAllMerchantOrders = async () => {
  try {
    const response = await apiAuth.get(`api/order/getByMerchant`);
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};
