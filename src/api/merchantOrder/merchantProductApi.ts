import apiAuth from '../indexAuth';

export const createProduct = async (formData: FormData) => {
  const response = await apiAuth.post('/api/product/create', formData, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data', // important for files
    },
  });
  console.log('response=========', response);
  return response.data;
};

export const getAllMerchantproduct = async () => {
  try {
    const response = await apiAuth.get(`api/product/getAll`);
    return response.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
