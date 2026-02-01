import apiAuth from '../indexAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
export const createProduct = async (formData: FormData) => {
  return await apiAuth.post('/api/product/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    transformRequest: data => {
      return data; // This prevents Axios from trying to stringify the FormData
    },
    timeout: 120000, // 2 minutes
  });
};
// Add ': Promise<any>' here
export const editProduct = async (
  id: string | number,
  formData: FormData,
  retries = 1,
): Promise<any> => {
  console.log('formData', formData);
  // <--- Explicit return type
  try {
    const response = await apiAuth.put(`/api/product/edit/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: data => data,
      timeout: 120000,
    });
    return response.data;
  } catch (error: any) {
    if (retries > 0 && !error.response) {
      console.log(
        `🔄 Network stall detected. Retrying edit... (${retries} left)`,
      );
      // Because this line returns the result of another editProduct call,
      // TS needs to know for sure what that call returns.
      return editProduct(id, formData, retries - 1);
    }

    if (error.response) throw error.response.data;
    throw new Error('Network Error: Could not reach server. Please try again.');
  }
};
// /**
//  * Updates a product using native fetch.
//  * Includes debugging for HTML responses.
//  * @param {string | number} id - The product ID
//  * @param {FormData} formData - The FormData object
//  */
// export const editProduct = async (id: string | number, formData: FormData) => {
//   try {
//     const token = await AsyncStorage.getItem('token');

//     // Ensure we don't end up with double slashes if API_BASE_URL ends with /
//     const baseUrl = API_BASE_URL.replace(/\/$/, '');

//     // FIX: Explicitly added '/api' here assuming your API_BASE_URL is root (e.g., http://10.0.2.2:3000)
//     // If your API_BASE_URL already includes '/api', remove the '/api' string below.
//     // Target URL: http://10.0.2.2:3000/api/product/edit/35
//     const fullUrl = `${baseUrl}/api/product/edit/${id}`;

//     console.log(`Sending PUT request to: ${fullUrl}`);

//     const response = await fetch(fullUrl, {
//       method: 'PUT',
//       headers: {
//         Accept: 'application/json',
//         Authorization: token ? `Bearer ${token}` : '',
//         // Content-Type is set automatically by fetch to 'multipart/form-data; boundary=...'
//       },
//       body: formData,
//     });

//     // 1. Get raw text first to debug "Unexpected character <" errors
//     const textResponse = await response.text();
//     console.log('Raw Server Response Status:', response.status);
//     // console.log('Raw Server Response Body:', textResponse); // Uncomment to see full HTML if needed

//     // 2. Check if response is JSON (starts with { or [)
//     if (textResponse.trim().startsWith('<')) {
//       throw new Error(
//         `Server returned HTML error (Status ${response.status}) at "${fullUrl}". Likely a 404 (Wrong Path) or 500 (Crash). Check your API_BASE_URL.`,
//       );
//     }

//     // 3. Parse JSON safely
//     let responseData;
//     try {
//       responseData = JSON.parse(textResponse);
//     } catch (e) {
//       throw new Error(
//         `Failed to parse server response: ${textResponse.substring(0, 100)}...`,
//       );
//     }

//     if (!response.ok) {
//       throw (
//         responseData ||
//         new Error(`Request failed with status ${response.status}`)
//       );
//     }

//     return responseData;
//   } catch (error: any) {
//     console.error('API Error in editProduct:', error);
//     throw error;
//   }
// };
export const getAllMerchantproduct = async () => {
  try {
    const response = await apiAuth.get(`api/product/getAll`);
    return response.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
