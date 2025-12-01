import apiAuth from './indexAuth';
export const createRider = async (
  partnerId: number,
  lng: number,
  lat: number,
) => {
  console.log('apiAuthsdfasdfasdfs', partnerId);

  console.log('apiAuthsdfasdfasdfs', lng);
  console.log('apiAuthsdfasdfasdfs', lng);

  const response = await apiAuth.post('api/rider/create', {
    partnerId,
    lng,
    lat,
  });
  console.log('response in rider api', response.data);
  return response.data;
};

export const createTenantImage = async (formData: FormData) => {
  try {
    const response = await apiAuth.post('api/tenantImage/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating tenant image:', error);
    throw error.response?.data || error.message;
  }
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
  console.log('deleting tenant with id:', id);
  const response = await apiAuth.delete(`api/tenant/delete/${Number(id)}`);
  console.log('delete response-------------------------:', response.data);
  return response.data;
};

export const getTenant = async () => {
  try {
    const response = await apiAuth.get(`api/tenant/getAll`);
    console.log('response in tenant api', response.data);
    return response.data; // Return the tenant data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
