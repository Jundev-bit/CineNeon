
import { useState } from 'react'
import './App.css'

function App() {
  const [videoAtivo, setVideoAtivo] = useState(null)

  return (
    <main className="cineneon">

      {/* CABEÇALHO */}
      <header className="cabecalho">
        <h1>CINE<span>NEON</span></h1>

        <nav className="menu">
          <a href="#inicio">Início</a>
          <a href="#filmes">Filmes</a>
          <a href="#series">Séries</a>
          <a href="#biblioteca">Minha Biblioteca</a>
        </nav>
      </header>

      {/* PÁGINA INICIAL */}
      <section id="inicio" className="destaque">
        <h2>Bem-vindo ao CineNeon</h2>
        <p>Sua biblioteca pessoal de filmes e séries.</p>
        <p>Assista aos seus vídeos online ou offline.</p>
      </section>

      {/* FILMES */}
      <section id="filmes" className="secao-conteudo">
        <h2>Filmes</h2>

        <div className="grade-videos">

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

        </div>
      </section>

      {/* PLAYER DE VÍDEO */}
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
            style={{ width: '100%', maxWidth: '800px' }}
          >
            Seu navegador não suporta este vídeo.
          </video>

        </section>
      )}

      {/* SÉRIES */}
      <section id="series" className="secao-conteudo">
        <h2>Séries</h2>

        <div className="grade-videos">

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

        </div>
      </section>

      {/* MINHA BIBLIOTECA */}
      <section id="biblioteca" className="secao-conteudo">
        <h2>Minha Biblioteca</h2>
        <p>Gerencie seus filmes e séries favoritos.</p>
      </section>

    </main>
  )
}

export default App
