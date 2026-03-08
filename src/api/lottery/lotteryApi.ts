import apiAuth from '../indexAuth';

export const getWinner = async () => {
  try {
    const response = await apiAuth.get(`api/lottery/getWinner`);
    console.log('response00000', response);
    return response.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
