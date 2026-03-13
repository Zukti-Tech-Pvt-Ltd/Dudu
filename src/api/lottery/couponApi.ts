import apiAuth from '../indexAuth';

export const getUserCoupons = async () => {
    try {
        const response = await apiAuth.get(`api/coupon/getUser`);
        console.log('response00000', response);
        return response.data; // Return the cart data
    } catch (err) {
        console.error(err);
        return []; // or handle error properly
    }
};


export const removeUserFromCoupon = async (id: number) => {
    console.log('userId=-========================================', id);
    const response = await apiAuth.delete(
        `api/coupon/deleteUser/${id}`,
    );
    console.log('userId=-========================================', response);

    return response.data;
};
