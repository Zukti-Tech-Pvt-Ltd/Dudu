import apiAuth from './indexAuth';

export const getnotification = async () => {
  try {
    const response = await apiAuth.get(`api/notification/getAll`);
    console.log('response in notificatoin api', response.data);
    return response.data; // Return the tenant data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
