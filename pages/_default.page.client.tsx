export { render }

import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'

interface PageContext {
  Page: React.ComponentType<any>
  pageProps: any
}

function render(pageContext: PageContext) {
  const { Page, pageProps } = pageContext
  const helmetContext = {}
  
  hydrateRoot(
    document.getElementById('root')!,
    <HelmetProvider context={helmetContext}>
      <Page {...pageProps} />
    </HelmetProvider>
  )
} 