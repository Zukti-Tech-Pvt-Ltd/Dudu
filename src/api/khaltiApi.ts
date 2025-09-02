import api from ".";


export const khaltiPayment = async () => {
    const response = await api.post('/api/khalti/initiate');
    return response.data;
};