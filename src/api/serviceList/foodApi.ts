import api from "..";




export const getRandomFood=async()=>{
    const response= await api.get('api/food/getRandom')
    return response.data
}