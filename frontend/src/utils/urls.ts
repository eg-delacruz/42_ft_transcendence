export const API_BASE_URL =
  	(import.meta.env.VITE_API_BASE_URL as string) && import.meta.env.VITE_API_BASE_URL !== ''
    	? (import.meta.env.VITE_API_BASE_URL as string)
    	: `${window.location.protocol}//${window.location.hostname}:3000/api`;

export const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const CHAT_SOCKET_URL = `${SOCKET_URL}/chat`;