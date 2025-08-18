import api from ".";


export const getRandomProducts=async()=>{
    const response= await api.get('/api/product/getRandom')
    return response.data
}