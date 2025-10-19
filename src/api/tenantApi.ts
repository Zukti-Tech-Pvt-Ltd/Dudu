import apiAuth from './indexAuth';
export const createTenant = async (
  name: string,
  phoneNumber: string,
  address: string,
  latitude?: number,
  longitude?: number,
) => {
    console.log('apiAuthsdfasdfasdfs',apiAuth)
  const response = await apiAuth.post('api/tenant/create', {
    name,
    phoneNumber,
    address,
    latitude,
    longitude,
  });
  return response.data;
};
export const editTenant = async (
  id: string,
  name?: string,
  phoneNumber?: string,
  address?: string,
  latitude?: number,
  longitude?: number,
) => {
  const response = await apiAuth.post(`api/tenant/edit/${id}`, {
    name,
    phoneNumber,
    address,
    latitude,
    longitude,
  });
  return response.data;
};

export const deleteTenant = async (id: string) => {
  const response = await apiAuth.post(`api/tenant/delete/${id}`);
  return response.data;
};

export const getTenant = async () => {
  try {
    const response = await apiAuth.get(`api/tenant/getAll`);
    console.log("response in tenant api",response.data)
    return response.data; // Return the tenant data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
