import apiAuth from './indexAuth';

export const getUser = async (
    id: string
) => {
  try {
    console.log('deleting tenant with id:', id);
    const response = await apiAuth.get(`api/user/getOne/${id}/`);
    console.log("response in tenant api=========",response.data)
    return response.data; // Return the tenant data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
