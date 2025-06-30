export { render }

import React from 'react'
import { renderToString } from 'react-dom/server'
import { HelmetProvider } from 'react-helmet-async'

interface PageContext {
  Page: React.ComponentType<any>
  pageProps: any
}

function render(pageContext: PageContext) {
  const { Page, pageProps } = pageContext
  const helmetContext: any = {}
  
  const pageHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <Page {...pageProps} />
    </HelmetProvider>
  )
  
  const { helmet } = helmetContext
  
  return {
    documentHtml: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${helmet ? helmet.title.toString() : '<title>NEXX TELECOM</title>'}
    ${helmet ? helmet.meta.toString() : '<meta name="description" content="Global telecom infrastructure." />'}
  </head>
  <body>
    <div id="root">${pageHtml}</div>
  </body>
</html>`
  }
} 