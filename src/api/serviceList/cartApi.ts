import apiAuth from "../indexAuth";






export const createCart=async(productId:number,quantity:number)=>{
    const response= await apiAuth.post("api/cart/create",{
        productId,
        quantity
    });
    return response.data
}

export const getCart=async()=>{
    const response= await apiAuth.get(`api/product/getOne}`)
    return response.data
}