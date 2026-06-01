export function setupAxiosInterceptors(axiosInstance) {
  axiosInstance.interceptors.request.use(
    (config) => {
      if (config.data && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json'
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        console.error('API error:', error.response.status, error.response.data)
      } else {
        console.error('Network error:', error.message)
      }
      return Promise.reject(error)
    }
  )
}
