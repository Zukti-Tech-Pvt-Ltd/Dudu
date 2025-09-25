import api from ".";


export const khaltiPayment = async (
    selectedItems: { id: string; quantity: number ,price: number}[],
    userId?:number,
    totalPrice?:number  
) => {
      const selectedItemsParam = encodeURIComponent(JSON.stringify(selectedItems));

    console.log('========selectedItems', selectedItems);
    console.log('=========userId', userId);
    const response = await api.post(`/api/khalti/initiate/${userId}/${selectedItemsParam}/${totalPrice}`);
    return response.data;
};