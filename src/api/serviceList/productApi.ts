import NativeComponentOverlay from 'react-native-maps/src/specs/NativeComponentOverlay';
import api from '..';
import apiAuth from '../indexAuth';
type DeleteImageParams = {
  imageUrl?: string;
  imageId?: number;
};
export const getByCategory = async (category: any) => {
  const response = await api.get(`api/product/getByCategory/${category}`);
  return response.data;
};

export const getOne = async (id: number) => {
  const response = await api.get(`api/product/getOne/${id}`);
  return response.data;
};
export const getMultiple = async (ids: string[]) => {
  const idsParam = ids.join(',');
  console.log('idsParam', idsParam);
  const response = await api.get(`api/product/getMultiple`, {
    params: { ids: idsParam },
  });
  return response.data;
};

export const getByName = async (name: string) => {
  try {
    const response = await api.get(`api/product/getByName`, {
      params: { name },
    });
    console.log('r1111111111111112121212121212esponse00000', response);
    return response.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};

export const getAllImagePerProduct = async (productId: number) => {
  try {
    const response = await api.get(
      `api/product/getAllImagePerProduct/${productId}`,
    );
    console.log('getAllImagePerProduct!!!!!!', response);
    return response.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};

export const deleteImage = async (params: DeleteImageParams) => {
  console.log('deleteImage params', params);
  const response = await apiAuth.delete('/api/product/deleteProductImage', {
    params,
  });
  console.log('deleteImage response', response);
  return response.data;
};
export const deleteVideo = async (id: number, videoUrl: string) => {
  console.log('deleteImage params', id, videoUrl);
  console.log('whyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy');
  const response = await apiAuth.delete(`/api/product/deleteVideo/${id}/`, {
    data: {
      videoUrl,
    },
  });
  console.log('deleteImage response', response);
  return response.data;
};
