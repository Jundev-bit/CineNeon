
import { useState } from 'react'
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

  const [itensBiblioteca, setItensBiblioteca] = useState([])


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


  // ==========================================
  // 3. CADASTRAR FILMES E SÉRIES
  // ==========================================

  function adicionarMidia(evento) {

    evento.preventDefault()

    if (!titulo.trim()) return

    const novaMidia = {
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      tipo: tipo,
      genero: genero.trim(),
      capa: capa
    }

    setItensBiblioteca((anteriores) => [
      ...anteriores,
      novaMidia
    ])

    // Limpar o formulário
    setTitulo('')
    setGenero('')
    setTipo('filme')
    setCapa('')

    evento.currentTarget.reset()
  }


  // ==========================================
  // 4. SEPARAR FILMES E SÉRIES
  // ==========================================

  const filmesCadastrados = itensBiblioteca.filter(
    (item) => item.tipo === 'filme'
  )

  const seriesCadastradas = itensBiblioteca.filter(
    (item) => item.tipo === 'serie'
  )


  // ==========================================
  // 5. EXCLUIR ITEM DA BIBLIOTECA
  // ==========================================

  function excluirMidia(id) {

    setItensBiblioteca((anteriores) =>
      anteriores.filter((item) => item.id !== id)
    )

  }


  // ==========================================
  // 6. INTERFACE DO APLICATIVO
  // ==========================================

  return (
    <main className="cineneon">

      {/* CABEÇALHO */}
      <header className="cabecalho">

        <h1>
          CINE<span>NEON</span>
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

        <h2>Bem-vindo ao CineNeon</h2>

        <p>Sua biblioteca pessoal de filmes e séries.</p>

        <p>Assista aos seus vídeos online ou offline.</p>

      </section>


      {/* ===================================== */}
      {/* FILMES */}
      {/* ===================================== */}

      <section id="filmes" className="secao-conteudo">

        <h2>Filmes</h2>

        <div className="grade-videos">

          {/* FILME DE TESTE 1 */}
          <article className="card-video">

            <div className="capa-video">
              <img
                src="/capas/Filme1.jpeg"
                alt="Capa do Filme 1"
                loading="lazy"
                decoding="async"
              />
            </div>

            <h3>Filme 1</h3>

            <p>Aventura</p>

            <button
              type="button"
              onClick={() => setVideoAtivo('/videos/filme1.mp4')}
            >
              ▶ Assistir
            </button>

          </article>


          {/* FILME DE TESTE 2 */}
          <article className="card-video">

            <div className="capa-video">
              <img
                src="/capas/Filme2.jpeg"
                alt="Capa do Filme 2"
                loading="lazy"
                decoding="async"
              />
            </div>

            <h3>Filme 2</h3>

            <p>Ficção científica</p>

            <button
              type="button"
              onClick={() => setVideoAtivo('/videos/filme2.mp4')}
            >
              ▶ Assistir
            </button>

          </article>


          {/* FILMES CADASTRADOS PELO USUÁRIO */}

          {filmesCadastrados.map((filme) => (

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

              <p>Vídeo ainda não adicionado</p>

            </article>

          ))}

        </div>

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

          {/* SÉRIE DE TESTE 1 */}
          <article className="card-video">

            <div className="capa-video">
              <img
                src="/capas/Serie1.jpg"
                alt="Capa da Série 1"
                loading="lazy"
                decoding="async"
              />
            </div>

            <h3>Série 1</h3>

            <p>Drama</p>

            <button
              type="button"
              onClick={() => setVideoAtivo('/videos/serie1.mp4')}
            >
              ▶ Assistir
            </button>

          </article>


          {/* SÉRIE DE TESTE 2 */}
          <article className="card-video">

            <div className="capa-video">
              <img
                src="/capas/Serie2.jpg"
                alt="Capa da Série 2"
                loading="lazy"
                decoding="async"
              />
            </div>

            <h3>Série 2</h3>

            <p>Comédia</p>

            <button
              type="button"
              onClick={() => setVideoAtivo('/videos/serie2.mp4')}
            >
              ▶ Assistir
            </button>

          </article>


          {/* SÉRIES CADASTRADAS PELO USUÁRIO */}

          {seriesCadastradas.map((serie) => (

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

              <p>Vídeo ainda não adicionado</p>

            </article>

          ))}

        </div>

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
          <label htmlFor="capa-midia">
            Capa do filme ou série
          </label>

          <input
            id="capa-midia"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={selecionarCapa}
          />


          {/* PRÉVIA DA CAPA */}
          {capa && (

            <img
              src={capa}
              alt="Prévia da capa selecionada"
              width="120"
            />

          )}


          {/* BOTÃO CADASTRAR */}
          <button type="submit">
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
