// pages/_app.tsx
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { registerCharts } from '../lib/registerChartJS'

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    registerCharts()
  }, [])

  return <Component {...pageProps} />
}
