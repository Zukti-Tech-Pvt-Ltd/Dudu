import apiAuth from './indexAuth';
export const createRider = async (
  partnerId: number,
  lng: number,
  lat: number,
  uniqueKey: string,
) => {
  const response = await apiAuth.post('api/rider/create', {
    partnerId,
    lng,
    lat,
    uniqueKey,
  });
  console.log('response in rider api', response.data);
  return response.data;
};
