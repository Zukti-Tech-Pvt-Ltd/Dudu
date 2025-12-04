import api from '..';
interface signUpPayload {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  userType: string;
  address: string;
  vehicleType?: string;
  vehicleNumber?: string;
}
export const login = async (
  username: string,
  password: string,
  deviceToken?: string,
) => {
  const response = await api.post('api/auth/login', {
    username,
    password,
    deviceToken,
  });
  return response.data;
};

export const signUp = async (signUpPayload: signUpPayload) => {
  console.log('signUpPayload', signUpPayload);
  const response = await api.post('api/auth/register', signUpPayload);

  return response.data;
};
// export const getUser = async (userId: number) => {
//   const response = await api.post(`api/user/getOne/${userId}/`);
//   return response.data;
// };
