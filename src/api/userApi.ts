import apiAuth from './indexAuth';

export const getUser = async (id: string) => {
  try {
    console.log('deleting tenant with id:', id);
    const response = await apiAuth.get(`api/user/getOne/${id}/`);
    console.log('response in tenant api=========', response.data);
    return response.data; // Return the tenant data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
export interface EditUserData {
  username?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  esewaNumber?: string;
  khaltiNumber?: string;
  isOnline?: boolean;
}
export const editUser = async (id: Number, userData: EditUserData) => {
  try {
    console.log('deleting tenant with id:', id);
    const response = await apiAuth.put(`api/user/edit/${id}/`, userData);
    console.log('response in tenant api=========', response.data);
    return response.data; // Return the tenant data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
