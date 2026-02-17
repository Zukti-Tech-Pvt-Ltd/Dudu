import apiAuth from '../indexAuth';

export const getMessage = async (
  senderId: number,
  receiverId: number,
  page: number = 1,
) => {
  try {
    // We add ?page=${page} to the end of the URL
    const response = await apiAuth.get(
      `api/message/getAll/${senderId}/${receiverId}?page=${page}`,
    );

    // It's helpful to log the page number to verify pagination is working
    console.log(
      `Fetched page ${page} for conversation ${senderId}-${receiverId}`,
    );

    return response.data.data;
  } catch (err) {
    console.error('Error fetching messages:', err);
    return [];
  }
};
export const getAllCustomerMessage = async () => {
  try {
    // We add ?page=${page} to the end of the URL
    console.log(`Fetched 77777777777777777777777777777777777777777777777777e:`);
    
    const response = await apiAuth.get(`api/message/getAllCustomerMessage`);

    // It's helpful to log the page number to verify pagination is working
    console.log(`Fetched all customer messages, response:`, response.data);
    return response.data.data;
  } catch (err) {
    console.error('Error fetching messages:', err);
    return [];
  }
};

export const createMessage = async (content: String, receiverId: number) => {
  const response = await apiAuth.post('api/message/create', {
    content,
    receiverId,
  });
  return response.data;
};
