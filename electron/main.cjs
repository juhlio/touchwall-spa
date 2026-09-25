// main.cjs
// Processo principal do Electron. Em dev, aponta pro servidor do Vite
// (npm run dev). Em produção, sobe um servidor estático local servindo o
// build (dist/) e abre nele — sem nenhuma dependência de rede externa,
// em tela cheia, do jeito que a TV touch precisa.

const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const { startStaticServer } = require('./static-server.cjs')

const isDev = process.env.NODE_ENV === 'development'

let mainWindow

async function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: !isDev,
    kiosk: !isDev,
    backgroundColor: '#070404',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    await mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    const distDir = path.join(__dirname, '..', 'dist')
    const { port } = await startStaticServer(distDir)
    await mainWindow.loadURL(`http://127.0.0.1:${port}`)
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
