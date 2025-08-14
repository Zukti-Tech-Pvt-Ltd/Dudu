import api from "..";


export const getAllServices=async()=>{
    const response= await api.get('/api/service/getAll')
    return response.data
}