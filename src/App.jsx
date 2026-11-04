
import { useState, useEffect } from 'react'
import {
  listarMidias,
  salvarMidia,
  removerMidia
} from './banco'

import './App.css'


function App() {

  // ==========================================
  // 1. ESTADOS DO APLICATIVO
  // ==========================================

  const [videoAtivo, setVideoAtivo] = useState(null)

  const [titulo, setTitulo] = useState('')
  const [genero, setGenero] = useState('')
  const [tipo, setTipo] = useState('filme')
  const [capa, setCapa] = useState('')

  const [arquivoVideo, setArquivoVideo] = useState(null)
  const [videosDaSessao, setVideosDaSessao] = useState({})
  const [videoImportado, setVideoImportado] = useState(null)

  const [busca, setBusca] = useState('')
  const [generoFiltro, setGeneroFiltro] = useState('todos')

  const [itensBiblioteca, setItensBiblioteca] = useState([])

  const [bancoPronto, setBancoPronto] = useState(false)

  useEffect(() => {
    let ativo = true

    listarMidias()
      .then((midias) => {
        if (ativo) {
          setItensBiblioteca(midias)
          setBancoPronto(true)
        }
      })
      .catch((erro) => {
        console.error('Erro ao carregar biblioteca:', erro)
        if (ativo) {
          alert('Não foi possível carregar a biblioteca.')
        }
      })

      return () => {
        ativo = false
      }
  }, [])

  const generosDisponiveis = [
    ...new Set(
      itensBiblioteca
        .map((item) => item.genero?.trim())
        .filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'))



  // ==========================================
  // 2. SELECIONAR CAPA DO COMPUTADOR
  // ==========================================

  function selecionarCapa(evento) {

    const arquivo = evento.target.files?.[0]

    if (!arquivo) return

    // Formatos permitidos
    const formatos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ]

    if (!formatos.includes(arquivo.type)) {
      alert('Selecione uma imagem JPG, PNG ou WebP.')
      evento.target.value = ''
      setCapa('')
      return
    }

    // Limite de 4 MB
    if (arquivo.size > 4 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 4 MB.')
      evento.target.value = ''
      setCapa('')
      return
    }

    // Ler o arquivo selecionado
    const leitor = new FileReader()

    leitor.onload = () => {
      if (typeof leitor.result === 'string') {
        setCapa(leitor.result)
      }
    }

    leitor.onerror = () => {
      alert('Não foi possível carregar a imagem.')
      setCapa('')
    }

    leitor.readAsDataURL(arquivo)
  }

  function selecionarVideo(evento) {
    const arquivo = evento.target.files?.[0]

    if (!arquivo) {
      setArquivoVideo(null)
      return
    }

    const formatos = ['video/mp4', 'video/webm']

    if (!formatos.includes(arquivo.type)) {
      alert('Selecionar um video MP4 ou WebM')
      evento.target.value = ''
      setArquivoVideo(null)
      return
    }

    setArquivoVideo(arquivo)
  }

  async function importarVideoElectron() {
    try {
      const resultado = await window.cineNeonAPI.importarVideo()

      if (!resultado) return

      setVideoImportado(resultado)
      setArquivoVideo(null)

    } catch (erro) {
      console.error('Erro ao importar video:', erro)
      alert('Não foi possível importar o vídeo.')
    }
  }

  // ==========================================
  // 3. CADASTRAR FILMES E SÉRIES
  // ==========================================

  async function adicionarMidia(evento) {
    evento.preventDefault()

    const formulario = evento.currentTarget

    if (!bancoPronto || !titulo.trim()) return

    const novaMidia = {
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      tipo: tipo,
      genero: genero.trim(),
      capa: capa,
      nomeVideo: videoImportado?.nome ?? arquivoVideo?.name ?? '',
      arquivoVideoSalvo: videoImportado?.arquivo ?? null
    }

    try {
      await salvarMidia(novaMidia)

      if (arquivoVideo) {
        const url = URL.createObjectURL(arquivoVideo)

        setVideosDaSessao((anteriores) => ({
          ...anteriores,
          [novaMidia.id]: url
        }))
      }

      setItensBiblioteca((anteriores) => [
        ...anteriores,
        novaMidia
      ])

      setTitulo('')
      setGenero('')
      setTipo('filme')
      setCapa('')
      setArquivoVideo(null)
      setVideoImportado(null)

      formulario.reset()

    } catch (erro) {
      console.error('Erro ao salvar mídia:', erro)
      alert('Não foi possível salvar o cadastro.')
    }
  }


  // ==========================================
  // 4. SEPARAR FILMES E SÉRIES
  // ==========================================

  const filmesCadastrados = itensBiblioteca.filter(
    (item) => item.tipo === 'filme'
  )
  const filmesFiltrados = filmesCadastrados.filter((filme) => {
    const texto = `${filme.titulo} ${filme.genero || ''}`.toLowerCase()

    return (
      texto.includes(busca.trim().toLowerCase()) &&
      (generoFiltro === 'todos' || filme.genero === generoFiltro)
    )
  })

  const seriesCadastradas = itensBiblioteca.filter(
    (item) => item.tipo === 'serie'
  )
  const seriesFiltradas = seriesCadastradas.filter((serie) => {
    const texto = `${serie.titulo} ${serie.genero || ''}`.toLowerCase()

    return (
      texto.includes(busca.trim().toLowerCase()) &&
      (generoFiltro === 'todos' || serie.genero === generoFiltro)
    )
  })


  // ==========================================
  // 5. EXCLUIR ITEM DA BIBLIOTECA
  // ==========================================


  async function excluirMidia(id) {
    try {
      await removerMidia(id)

      setItensBiblioteca((anteriores) =>
        anteriores.filter((item) => item.id !== id)
      )

    } catch (erro) {
      console.error('Erro ao excluir mídia:', erro)
      alert('Não foi possível excluir o cadastro.')
    }
  }

  function obterUrlVideo(midia) {
    if (
      window.cineNeonAPI?.importarVideo &&
      midia.arquivoVideoSalvo
    ) {
      return `cineneon-video://video/${encodeURIComponent(midia.arquivoVideoSalvo)}`
    }

    return videosDaSessao[midia.id] ?? null
  }


  // ==========================================
  // 6. INTERFACE DO APLICATIVO
  // ==========================================

  return (
    <main className="cineneon">

      {/* CABEÇALHO */}
      <header className="cabecalho">

        <h1>
          CINE<span>INPAR</span>
        </h1>

        <nav className="menu">
          <a href="#inicio">Início</a>
          <a href="#filmes">Filmes</a>
          <a href="#series">Séries</a>
          <a href="#biblioteca">Minha Biblioteca</a>
        </nav>

      </header>


      {/* ===================================== */}
      {/* PÁGINA INICIAL */}
      {/* ===================================== */}

      <section id="inicio" className="destaque">

        <h2>Bem-vindo</h2>

        <p>Sua biblioteca pessoal de filmes e séries.</p>

        <p>Assista aos seus vídeos online ou offline.</p>


        <div className="area-busca">
          <label htmlFor="buscar-midia">
            Buscar na biblioteca
          </label>

          <input
            id="buscar-midia"
            type="search"
            placeholder="Pesquisar filmes ou séries..."
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
          
          <label htmlFor="filtro-genero">
            Gênero
          </label>

          <select
            id="filtro-genero"
            value={generoFiltro}
            onChange={(evento) => setGeneroFiltro(evento.target.value)}
          >
            <option value="todos">Todos os gêneros</option>

            {generosDisponiveis.map((genero) => (
              <option key={genero} value={genero}>
                {genero}
              </option>
            ))}
          </select>

        </div>

      </section>

      {/* ===================================== */}
      {/* FILMES */}
      {/* ===================================== */}

      <section id="filmes" className="secao-conteudo">

        <h2>Filmes</h2>

        <div className="grade-videos">

          {/* FILMES CADASTRADOS PELO USUÁRIO */}

          {filmesFiltrados.map((filme) => (

            <article className="card-video" key={filme.id}>

              <div className="capa-video">

                {filme.capa ? (
                  <img
                    src={filme.capa}
                    alt={`Capa de ${filme.titulo}`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  '🎬'
                )}

              </div>

              <h3>{filme.titulo}</h3>

              <p>
                {filme.genero || 'Gênero não informado'}
              </p>

              <button
                type="button"
                disabled={!obterUrlVideo(filme)}
                onClick={() => setVideoAtivo(obterUrlVideo(filme))}
              >
                ▶ Assistir
              </button>

              {!obterUrlVideo(filme) && (
                <p>Vídeo ainda não vinculado.</p>
              )}

            </article>

          ))}

        </div>

        {filmesCadastrados.length > 0 && filmesFiltrados.length === 0 && (
          <div className="estado-vazio">
            <p>Nenhum filme encontrado na pesquisa.</p>
          </div>
        )}

        {filmesCadastrados.length === 0 && (
          <div className="estado-vazio">
            <span className="estado-vazio-icone" aria-hidden="true">
              🎞️
            </span>
            <p>Seus filmes cadastrados aparecerão aqui.</p>
          </div>
        )}


      </section>


      {/* ===================================== */}
      {/* PLAYER DE VÍDEO */}
      {/* ===================================== */}

      {videoAtivo && (

        <section className="secao-conteudo player-container">

          <h2>Reproduzindo vídeo</h2>

          <button
            type="button"
            onClick={() => setVideoAtivo(null)}
          >
            Fechar Player
          </button>

          <video
            key={videoAtivo}
            src={videoAtivo}
            controls
            playsInline
            preload="metadata"
            style={{
              width: '100%',
              maxWidth: '800px'
            }}
          >
            Seu navegador não suporta este vídeo.
          </video>

        </section>

      )}


      {/* ===================================== */}
      {/* SÉRIES */}
      {/* ===================================== */}

      <section id="series" className="secao-conteudo">

        <h2>Séries</h2>

        <div className="grade-videos">

          {/* SÉRIES CADASTRADAS PELO USUÁRIO */}

          {seriesFiltradas.map((serie) => (

            <article className="card-video" key={serie.id}>

              <div className="capa-video">

                {serie.capa ? (
                  <img
                    src={serie.capa}
                    alt={`Capa de ${serie.titulo}`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  '📺'
                )}

              </div>

              <h3>{serie.titulo}</h3>

              <p>
                {serie.genero || 'Gênero não informado'}
              </p>
              
              <button
                type="button"
                disabled={!obterUrlVideo(serie)}
                onClick={() => setVideoAtivo(obterUrlVideo(serie))}
              >
                ▶ Assistir
              </button>

              {!obterUrlVideo(serie) && (
                <p>Vídeo ainda não vinculado.</p>
              )}


            </article>

          ))}

        </div>

        {seriesCadastradas.length > 0 && seriesFiltradas.length === 0 && (
          <div className="estado-vazio">
            <p>Nenhuma série encontrada na pesquisa.</p>
          </div>
        )}

        {seriesCadastradas.length === 0 && (
          <div className="estado-vazio">
            <span className="estado-vazio-icone" aria-hidden="true">
              📺
            </span>
            <p>Suas séries cadastradas aparecerão aqui.</p>
          </div>
        )}

      </section>


      {/* ===================================== */}
      {/* MINHA BIBLIOTECA */}
      {/* ===================================== */}

      <section id="biblioteca" className="secao-conteudo">

        <h2>Minha Biblioteca</h2>

        <p>Gerencie seus filmes e séries favoritos.</p>


        {/* FORMULÁRIO DE CADASTRO */}

        <form
          className="form-cadastro"
          onSubmit={adicionarMidia}
        >

          {/* TÍTULO */}
          <input
            type="text"
            placeholder="Título do filme ou série"
            value={titulo}
            onChange={(evento) =>
              setTitulo(evento.target.value)
            }
            required
          />


          {/* TIPO DE MÍDIA */}
          <select
            value={tipo}
            onChange={(evento) =>
              setTipo(evento.target.value)
            }
            aria-label="Tipo de mídia"
          >

            <option value="filme">Filme</option>
            <option value="serie">Série</option>

          </select>


          {/* GÊNERO */}
          <input
            type="text"
            placeholder="Gênero"
            value={genero}
            onChange={(evento) =>
              setGenero(evento.target.value)
            }
          />


          {/* CAPA DO FILME OU SÉRIE */}
          <label className="rotulo-upload" htmlFor="capa-midia">
            Capa do filme ou série
          </label>

          <input className="input-upload"
            id="capa-midia"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={selecionarCapa}
          />

          <label htmlFor="capa-midia" className="botao-upload">
            🖼️ Selecionar capa
          </label>

          <span className="nome-arquivo">
            {capa ? 'Capa selecionada' : 'Nenhuma capa selecionada'}
          </span>

          {/* PRÉVIA DA CAPA */}
          {capa && (

            <img
              src={capa}
              alt="Prévia da capa selecionada"
              width="120"
            />

          )}

          <label className="rotulo-upload">
            Arquivo de vídeo
          </label>

          {window.cineNeonAPI?.importarVideo ? (
            <button
              type="button"
              className="botao-upload"
              onClick={importarVideoElectron}
            >
              🎬 Selecionar vídeo
            </button>
          ) : (
            <>
              <input
                className="input-upload"
                id="arquivo-video"
                type="file"
                accept="video/mp4,video/webm"
                onChange={selecionarVideo}
              />

              <label htmlFor="arquivo-video" className="botao-upload">
                🎬 Selecionar vídeo
              </label>
            </>
          )}

          <span className="nome-arquivo">
            {videoImportado?.nome ??
              arquivoVideo?.name ??
              'Nenhum vídeo selecionado'}
          </span>


          {/* BOTÃO CADASTRAR */}
          <button type="submit" disabled={!bancoPronto}>
            + Adicionar à Biblioteca
          </button>

        </form>


        {/* ================================= */}
        {/* LISTA DE ITENS CADASTRADOS */}
        {/* ================================= */}

        <div className="lista-biblioteca">

          {itensBiblioteca.length === 0 && (

            <p>Nenhum filme ou série cadastrado ainda.</p>

          )}


          {itensBiblioteca.map((item) => (

            <div
              key={item.id}
              className="item-biblioteca"
            >

              <h3>{item.titulo}</h3>

              <p>
                {item.tipo === 'filme' ? 'Filme' : 'Série'}

                {item.genero ? ` • ${item.genero}` : ''}
              </p>


              {/* BOTÃO EXCLUIR */}
              <button
                type="button"
                onClick={() => excluirMidia(item.id)}
              >
                Excluir
              </button>

            </div>

          ))}

        </div>

      </section>

    </main>
  )
}

export default App
