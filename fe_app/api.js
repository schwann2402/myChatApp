import axios from 'axios'
import { Platform } from 'react-native'

export const address = Platform.OS === 'ios' ? 'localhost:8000' : '10.0.2.2:8000'

const api = axios.create({
    baseURL:'http://' + address,
    headers: {
        'Content-Type': 'application/json',
    }   
})

export default api