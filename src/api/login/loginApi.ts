import api from '..';

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
// export const getUser = async (userId: number) => {
//   const response = await api.post(`api/user/getOne/${userId}/`);
//   return response.data;
// };
