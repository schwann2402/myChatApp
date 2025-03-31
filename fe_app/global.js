import { create } from "zustand";
import {save, remove, getValueFor} from "@/secure";
import {api} from "@/api";
import {address} from "@/api";
import utils from "@/utils";

const useGlobal = create((set) => ({

    // initialization...
    initialized: false,
    async init() {
        const credentials = await getValueFor('credentials')
        if (credentials) {
            try {
                const response = await api.post('/chat/signin/', {
                    username: credentials.username,
                    password: credentials.password
                })
                if (response.status !== 200) {
                    throw 'Authentication error'
                }
                const user = response.data.user
                const tokens = response.data.tokens

                save('tokens', tokens)
                set({ authenticated: true, user })
            } catch (error) {
                console.error('Authentication error:', error)
            }
        }
        set({ initialized: true })
    },

    // Authentication... 
    authenticated: false,
    user: {},

    login: (credentials, user, tokens) => {
        save('credentials', credentials)
        console.log("Login tokens", tokens)
        save('tokens', tokens)
        set({ authenticated: true, user })},
    logout: () => {
        remove('credentials')
        remove('tokens')
        set({ authenticated: false, user: {} })
    },

    // Socket
    socket: null,
    socketConnect: async () => {
        const tokens = await getValueFor('tokens')
        console.log('tokens', tokens)
        if (!tokens) {
            return
        }
        console.log(`ws://${address}/chat/?token=${tokens.access}`)
        const socket = new WebSocket(`ws://${address}/chat/?token=${tokens.access}`);
        socket.onopen = () => {
            utils.log('socket opened')
        }
        socket.onmessage = () => {
            utils.log('socket message')
        }
        socket.onerror = (e) => {
            utils.log('socket error', e.message)
        }
        socket.onclose = () => {
            utils.log('socket closed')
        }
        set({ socket })
    },
    socketClose: () => {

    }


}))

export default useGlobal