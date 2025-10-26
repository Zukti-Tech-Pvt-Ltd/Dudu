import apiAuth from './indexAuth';



export const getByLetter = async (name: string) => {
  try {
    const response = await apiAuth.get(`api/product/getByLetter`,{
      params: { name }, 
    });
    console.log("r1111111111111112121212121212esponse00000",response)
    return response.data.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};
