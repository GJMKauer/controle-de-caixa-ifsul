import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

/** Cliente HTTP centralizado para a API de controle de caixa.*/
const httpClient = axios.create({ baseURL: `${API_BASE_URL}/api` });

export { API_BASE_URL, httpClient };
