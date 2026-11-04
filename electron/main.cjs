
const { app, BrowserWindow, dialog, ipcMain, protocol, net } = require('electron')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const fs = require('node:fs/promises')
const { randomUUID} = require('node:crypto')

// ==========================================
// 1. CRIAR A JANELA PRINCIPAL
// ==========================================

protocol.registerSchemesAsPrivileged([
    {
        scheme: 'cineneon-video',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true
        }
    }
])

function obterPastaVideos() {
    return path.join(app.getPath('userData'), 'videos')
}


function registrarProtocoloVideos() {

  protocol.handle('cineneon-video', async (requisicao) => {
    try {
      const endereco = new URL(requisicao.url)
      const nomeArquivo = endereco.pathname.slice(1)

      const formatoValido =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp4|webm)$/i

      if (
        endereco.hostname !== 'video' ||
        !formatoValido.test(nomeArquivo)
      ) {
        return new Response('Vídeo inválido', {
          status: 404
        })
      }

      const caminho = path.join(
        obterPastaVideos(),
        nomeArquivo
      )

      const alcance = requisicao.headers.get('range')

      const opcoes = alcance
        ? { headers: { Range: alcance } }
        : {}

      return await net.fetch(
        pathToFileURL(caminho).toString(),
        opcoes
      )

    } catch (erro) {
      console.error('Erro ao carregar vídeo:', erro)

      return new Response('Vídeo indisponível', {
        status: 404
      })
    }
  })
}


async function importarVideo() {
  const selecao = await dialog.showOpenDialog({
    title: 'Selecionar vídeo para o CineNeon',
    properties: ['openFile'],
    filters: [
      { name: 'Vídeos', extensions: ['mp4', 'webm'] }
    ]
  })

  if (selecao.canceled || selecao.filePaths.length === 0) {
    return null
  }

  const origem = selecao.filePaths[0]
  const extensao = path.extname(origem).toLowerCase()

  if (!['.mp4', '.webm'].includes(extensao)) {
    throw new Error('Formato de vídeo não permitido.')
  }

  const pasta = obterPastaVideos()

  await fs.mkdir(pasta, { recursive: true })

  const nomeSalvo = `${randomUUID()}${extensao}`

  await fs.copyFile(
    origem,
    path.join(pasta, nomeSalvo)
  )

  return {
    nome: path.basename(origem),
    arquivo: nomeSalvo
  }
}


function criarJanela() {

  const janela = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,

    backgroundColor: '#071719',
    title: 'CineNeon',

    autoHideMenuBar: true,

    webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
    }
  })

  // ==========================================
  // 2. CARREGAR O REACT
  // ==========================================

  if (!app.isPackaged) {

    // Modo desenvolvimento
    janela.loadURL('http://localhost:5174/')

  } else {

    // Modo aplicativo instalado
    janela.loadFile(
      path.join(__dirname, '../dist/index.html')
    )

  }

}

// ==========================================
// 3. INICIAR O ELECTRON
// ==========================================

app.whenReady().then(() => {

    registrarProtocoloVideos()

    ipcMain.handle('cineneon:importar-video', (evento) => {
        const janela = BrowserWindow.fromWebContents(evento.sender)

        if (
            !janela ||
            evento.senderFrame !== janela.webContents.mainFrame
        ) {
            throw new Error('Acesso negado.')
        }
        
        return importarVideo()
    })

    criarJanela()

  // Reabrir a janela no macOS
  app.on('activate', () => {

    if (BrowserWindow.getAllWindows().length === 0) {
      criarJanela()
    }

  })

})

// ==========================================
// 4. ENCERRAR O APLICATIVO
// ==========================================

app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {
    app.quit()
  }

})
