import apiAuth from '../indexAuth';

export const getMessage = async (senderId: number, receiverId: number) => {
  try {
    console.log(
      'fetching messages for senderId:',
      senderId,
      'receiverId:',
      receiverId,
    );
    const response = await apiAuth.get(
      `api/message/getAll/${senderId}/${receiverId}`,
    );
    console.log('r1111111111111112121212121212esponse00000', response);
    return response.data.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
