const fs = require('fs')
const path = require('path')
const express = require('express')
const { createServer: createViteServer } = require('vite')
const compression = require('compression')
const serveStatic = require('serve-static')
const chalk = require('chalk')

const PORT = process.env.PORT || 3000
const app = express()

const NODE_ENV = process.env.NODE_ENV
const isTest = NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD

const resolve = url => path.resolve(__dirname, url)

async function createServer(
  root = process.cwd(),
  isProd = NODE_ENV === 'production'
) {
  const indexProd = isProd
    ? fs.readFileSync(resolve('dist/client/index.html'), 'utf-8')
    : ''


  let vite
  if (!isProd) {
    vite = await createViteServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: 'ssr',
        watch: {
          usePolling: true,
          interval: 100
        }
      }
    })
    app.use(vite.middlewares)
  } else {
    app.use(compression())
    app.use(
      serveStatic(resolve('dist/client'), {
        index: false
      })
    )
  }

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      let template, render
      if (!isProd) {
        template = fs.readFileSync(resolve('index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('src/entry-server.tsx')).render
      } else {
        template = indexProd
        render = (require(resolve('dist/server/entry-server.js'))).render
      }

      const context = {}
      const appHtml = render(url, context)

      if (context.url) {
        return res.redirect(301, context.url)
      }

      const html = template.replace(`<!--ssr-outlet-->`, appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e)
      console.error(e.stack)
      res.status(500).end(e.stack)
    }
  })

  return { app, vite }
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(PORT, () => {
      console.log(chalk.greenBright(`App is listening at http://localhost:${PORT}!`))
    })
  )
}

exports.createServer = createServer
