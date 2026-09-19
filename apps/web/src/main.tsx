import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, App as AntdApp } from 'antd'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
})

const antdTheme = {
  token: {
    colorPrimary: '#0ea5e9',
    borderRadius: 8,
    fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif',
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={antdTheme}>
      <AntdApp>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>,
)
