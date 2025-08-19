import api from "..";




export const getByCategory=async(category: any)=>{
    const response= await api.get(`api/product/getByCategory/${category}`)
    return response.data
}


export const getOne=async(id:number)=>{
    const response= await api.get(`api/product/getOne/${id}`)
    return response.data
}