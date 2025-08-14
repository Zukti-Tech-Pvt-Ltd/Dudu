import api from "..";





export const getRandomLihamoto=async()=>{
    const response= await api.get('api/lihamoto/getRandom')
    return response.data
}