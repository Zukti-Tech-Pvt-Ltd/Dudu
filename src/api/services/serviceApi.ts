import api from "..";


export const getAllServices=async()=>{
    const response= await api.get('/api/service/getAll')
    console.log('getAllServices',response.data);
    return response.data
}