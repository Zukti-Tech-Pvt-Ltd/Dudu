import apiAuth from '../indexAuth';

export const createProduct = async (formData: FormData) => {
  console.log('response=========', formData);

  const response = await apiAuth.post('/api/product/create', formData, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data', // important for files
    },
  });
  console.log('response=========', response);
  return response.data;
};
// export const editProduct = async (id: number, formData: any) => {
//   console.log('id', id);
//   const dataObj: Record<string, any> = {};
//   formData._parts.forEach(([key, value]: [string, any]) => {
//     dataObj[key] = value;
//   });
//   console.log(dataObj.price); // 1012

//   const response = await apiAuth.put(
//     `/api/product/edit/${id}`,
//     {
//       name: dataObj.name,
//       description: dataObj.description,
//       category: dataObj.category,
//       count: dataObj.count,
//       rate: dataObj.rate,

//       type: dataObj.type,
//       serviceId: dataObj.serviceId,
//       order: dataObj.order,

//       price: dataObj.price,
//     },
//     {
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'multipart/form-data', // important for files
//       },
//     },
//   );
// export const editProduct = async (id: number, formData: FormData) => {
//   console.log('id', id);

//   const response = await apiAuth.put(`/api/product/edit/${id}`, formData, {
//     headers: {
//       Accept: 'application/json',
//       // DO NOT set Content-Type here. Axios handles it.
//     },
//   });

//   console.log('response=========', response);
//   return response.data;
// };
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

/**
 * Updates a product using native fetch.
 * Includes debugging for HTML responses.
 * @param {string | number} id - The product ID
 * @param {FormData} formData - The FormData object
 */
export const editProduct = async (id: string | number, formData: FormData) => {
  try {
    const token = await AsyncStorage.getItem('token');

    // Ensure we don't end up with double slashes if API_BASE_URL ends with /
    const baseUrl = API_BASE_URL.replace(/\/$/, '');

    // FIX: Explicitly added '/api' here assuming your API_BASE_URL is root (e.g., http://10.0.2.2:3000)
    // If your API_BASE_URL already includes '/api', remove the '/api' string below.
    // Target URL: http://10.0.2.2:3000/api/product/edit/35
    const fullUrl = `${baseUrl}/api/product/edit/${id}`;

    console.log(`Sending PUT request to: ${fullUrl}`);

    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        // Content-Type is set automatically by fetch to 'multipart/form-data; boundary=...'
      },
      body: formData,
    });

    // 1. Get raw text first to debug "Unexpected character <" errors
    const textResponse = await response.text();
    console.log('Raw Server Response Status:', response.status);
    // console.log('Raw Server Response Body:', textResponse); // Uncomment to see full HTML if needed

    // 2. Check if response is JSON (starts with { or [)
    if (textResponse.trim().startsWith('<')) {
      throw new Error(
        `Server returned HTML error (Status ${response.status}) at "${fullUrl}". Likely a 404 (Wrong Path) or 500 (Crash). Check your API_BASE_URL.`,
      );
    }

    // 3. Parse JSON safely
    let responseData;
    try {
      responseData = JSON.parse(textResponse);
    } catch (e) {
      throw new Error(
        `Failed to parse server response: ${textResponse.substring(0, 100)}...`,
      );
    }

    if (!response.ok) {
      throw (
        responseData ||
        new Error(`Request failed with status ${response.status}`)
      );
    }

    return responseData;
  } catch (error: any) {
    console.error('API Error in editProduct:', error);
    throw error;
  }
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
