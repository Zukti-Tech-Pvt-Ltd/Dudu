import apiAuth from "../indexAuth";






export const createCart=async(productId:number,quantity:number)=>{
    const response= await apiAuth.post("api/cart/create",{
        productId,
        quantity
    });
    return response.data
}

export const getCart=async()=>{
    try {
            console.log("response00000")

    const response = await apiAuth.get(`api/cart/getAll`);
    console.log("response00000",response)
    return response.data; // Return the cart data
    
  } catch (err) {
    console.error(err);
    return []; // or handle error properly
  }
};