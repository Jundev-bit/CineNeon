
const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  protocol,
  net
} = require('electron')

const path = require('node:path')
const { pathToFileURL } = require('node:url')
const fs = require('node:fs/promises')
const { randomUUID } = require('node:crypto')

// ==========================================
// 1. REGISTRAR PROTOCOLO DE VÍDEOS
// ==========================================

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'cineneon-video',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
])

// ==========================================
// 2. PASTA PERMANENTE DOS VÍDEOS
// ==========================================

function obterPastaVideos() {
  return path.join(app.getPath('userData'), 'videos')
}

// ==========================================
// 3. PROTOCOLO DE REPRODUÇÃO
// ==========================================

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
        console.error(
          '[CineNeon] Nome de vídeo inválido:',
          nomeArquivo
        )

        return new Response('Vídeo inválido', {
          status: 404
        })
      }

      const caminho = path.join(
        obterPastaVideos(),
        nomeArquivo
      )

      await fs.access(caminho)

      const resposta = await net.fetch(
        pathToFileURL(caminho).toString(),
        {
          headers: requisicao.headers
        }
      )

      console.log(
        '[CineNeon] Reproduzindo:',
        nomeArquivo,
        'Status:',
        resposta.status
      )

      return resposta

    } catch (erro) {
      console.error(
        '[CineNeon] Erro ao carregar vídeo:',
        erro
      )

      return new Response('Vídeo indisponível', {
        status: 404
      })
    }
  })
}

// ==========================================
// 4. IMPORTAR VÍDEOS
// ==========================================

async function importarVideo() {
  const selecao = await dialog.showOpenDialog({
    title: 'Selecionar vídeo para o CineNeon',
    properties: ['openFile'],
    filters: [
      {
        name: 'Vídeos',
        extensions: ['mp4', 'webm']
      }
    ]
  })

  if (
    selecao.canceled ||
    selecao.filePaths.length === 0
  ) {
    return null
  }

  const origem = selecao.filePaths[0]
  const extensao = path.extname(origem).toLowerCase()

  if (!['.mp4', '.webm'].includes(extensao)) {
    throw new Error('Formato de vídeo não permitido.')
  }

  const pasta = obterPastaVideos()

  await fs.mkdir(pasta, {
    recursive: true
  })

  const nomeSalvo = `${randomUUID()}${extensao}`

  await fs.copyFile(
    origem,
    path.join(pasta, nomeSalvo)
  )

  console.log(
    '[CineNeon] Vídeo importado:',
    nomeSalvo
  )

  return {
    nome: path.basename(origem),
    arquivo: nomeSalvo
  }
}

// ==========================================
// 5. CRIAR JANELA PRINCIPAL
// ==========================================

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

  if (!app.isPackaged) {
    janela.loadURL('http://localhost:5174/')
  } else {
    janela.loadFile(
      path.join(__dirname, '../dist/index.html')
    )
  }
}

// ==========================================
// 6. INICIAR ELECTRON
// ==========================================

app.whenReady().then(() => {
  registrarProtocoloVideos()

  ipcMain.handle(
    'cineneon:importar-video',
    (evento) => {
      const janela = BrowserWindow.fromWebContents(
        evento.sender
      )

      if (
        !janela ||
        evento.senderFrame !==
          janela.webContents.mainFrame
      ) {
        throw new Error('Acesso negado.')
      }

      return importarVideo()
    }
  )

  criarJanela()

  app.on('activate', () => {
    if (
      BrowserWindow.getAllWindows().length === 0
    ) {
      criarJanela()
    }
  })
})

// ==========================================
// 7. ENCERRAR APLICATIVO
// ==========================================

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
