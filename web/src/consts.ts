export const API_ORIGIN = import.meta.env.MODE === 'development'
    ? 'http://0.0.0.0:8000/api' : `${location.origin}/api`