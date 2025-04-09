import { create } from "zustand";
import {save, remove, getValueFor} from "@/secure";
import {api} from "@/api";
import {address} from "@/api";
import utils from "@/utils";

// Socket response handlers
function responseThumbnail(set, get, data) {
    set(state => ({
        user: data
    }))
}








const useGlobal = create((set, get) => ({

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
        const tokensString = await getValueFor('tokens')
        if (!tokensString) {
            return
        }
        const tokens = JSON.parse(tokensString)
      
        const socket = new WebSocket(`ws://${address}/chat/?token=${tokens.access}`);
        socket.onopen = () => {
            utils.log('socket opened')
        }
        socket.onmessage = (e) => {
            const data = JSON.parse(e.data)
            utils.log('Socket message received:', data);

            const responses = {
                'thumbnail': responseThumbnail
            }

            const resp = responses[data.source]
            if (!resp) {
                utils.log('data.source not found', data.source)
                return
            }
            
            // Call the response function
            resp(set, get, data)
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

    },

    uploadThumbnail: (image) => {
        const socket = get().socket 
        if (!socket || !image) {
            return
        }
        console.log(image)
        
        // Generate a filename if one isn't provided
        let filename = image.fileName;
        if (!filename && image.uri) {
            // Extract filename from URI or generate a random one with timestamp
            const uriParts = image.uri.split('/');
            filename = uriParts[uriParts.length - 1];
            
            // If no extension, add .jpg as fallback
            if (!filename.includes('.')) {
                filename += '.jpg';
            }
        }
        
        socket.send(JSON.stringify({
            source: 'thumbnail',
            base64: image.base64,
            filename: filename
        }))
    }


}))

export default useGlobal