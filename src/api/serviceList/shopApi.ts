import api from "..";





export const getRandomShop=async()=>{
    const response= await api.get('api/shop/getRandom')
    return response.data
}