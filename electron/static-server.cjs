// static-server.cjs
// Servidor HTTP estático mínimo, sem dependências externas, usado para
// servir o build (dist/) dentro do Electron. Rodar via file:// quebraria
// os caminhos absolutos (/data/..., /assets/...) usados no app, então
// servimos em http://localhost com uma porta livre escolhida pelo SO.

const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}

function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const requestPath = decodeURIComponent((req.url ?? '/').split('?')[0])
      const resolvedPath = path.normalize(path.join(rootDir, requestPath))

      if (!resolvedPath.startsWith(rootDir)) {
        res.writeHead(403)
        res.end('Forbidden')
        return
      }

      const filePath = fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()
        ? resolvedPath
        : path.join(rootDir, 'index.html')

      const ext = path.extname(filePath)
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream' })
      fs.createReadStream(filePath).pipe(res)
    })

    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      resolve({ server, port })
    })
  })
}

module.exports = { startStaticServer }
