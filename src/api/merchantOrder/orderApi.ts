import apiAuth from '../indexAuth';

export const getAllMerchantOrders = async (status: string) => {
  try {
    const response = await apiAuth.get(`api/order/getByMerchant`, {
      params: { status },
    });
    console.log('r1111111111111112121212121212esponse00000', response);
    return response.data.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};

export const editMerchantOrder = async (status: string, id: number) => {
  console.log('apiAuthsdfasdfasdfs', id);
  console.log('status', status);
  const response = await apiAuth.put(`api/order/edit/${id}`, {
    status,
  });
  console.log('response in rider api', response.data);
  return response.data;
};

export const getAllRider = async (lat: number, lng: number) => {
  try {
    const response = await apiAuth.get(`api/user/getAllRiders/${lat}/${lng}`);
    console.log('r1111111111111112121212121212esponse00000', response);
    return response.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};

export const getRiderWhoAccepted = async (key: string) => {
  try {
    console.log('111111!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ', key);

    const response = await apiAuth.get(`api/rider/getAll/${key}`);
    console.log('111111-----------------------', response);
    return response.data.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};

export const AssignOrderToRider = async (
  id: number,
  orderId: number,
  latitude: number,
  longitude: number,
  address: string,
) => {
  try {
    console.log(
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!AssignOrderToRider!!!!!!!!!!!!!!!!!!!! ',
    );

    const response = await apiAuth.get(
      `api/rider/AssignOrderToRider/${id}/${orderId}/${latitude}/${longitude}/${address}`,
    );
    console.log('AssignOrderToRider-------------------', response);
    return response;
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
export const rejectOrderToRider = async (id: number, uniqueId: string) => {
  try {
    console.log(
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!rejectOrderToRider!!!!!!!!!!!!!!!!!!!! ',
    );

    const response = await apiAuth.get(
      `api/rider/rejectOrderToRider/${id}/${uniqueId}`,
    );
    console.log('AssignOrderToRider-------------------', response);
    return response;
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
