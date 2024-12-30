import axios from "axios";


export const axiosReq = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    }
})
