import NativeComponentOverlay from "react-native-maps/src/specs/NativeComponentOverlay";
import api from "..";




export const getByCategory=async(category: any)=>{
    const response= await api.get(`api/product/getByCategory/${category}`)
    return response.data
}

export const getOne=async(id:number)=>{
    const response= await api.get(`api/product/getOne/${id}`)
    return response.data
}

export const getByName=async(name:string)=>{
   try {
    const response = await api.get(`api/product/getByName`,{
      params: { name }, 
    });
    console.log("r1111111111111112121212121212esponse00000",response)
    return response.data; // Return the cart data
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
}

