import axios from 'axios'

function createClient(baseURL) {
  const client = axios.create({ baseURL })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const message =
        error.response?.data?.message || error.message || 'Erreur inconnue'
      return Promise.reject(new Error(message))
    },
  )

  return client
}

export const livresClient = createClient(import.meta.env.VITE_LIVRES_API_URL)
export const utilisateursClient = createClient(
  import.meta.env.VITE_UTILISATEURS_API_URL,
)
export const empruntsClient = createClient(
  import.meta.env.VITE_EMPRUNTS_API_URL,
)
