import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link className="brand" href="/" aria-label="Restora, inicio">
          <span className="brand-mark" aria-hidden="true">R</span><span>restora</span>
        </Link>
        <nav className="landing-nav" aria-label="Acceso">
          <Link className="nav-login" href="/login">Iniciar sesión</Link>
          <Link className="nav-register" href="/registro">Crear cuenta <span aria-hidden="true">→</span></Link>
        </nav>
      </header>
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow"><span className="status-dot" />OPERACIÓN SIMPLE, SERVICIO EXCELENTE</p>
          <h1>Tu restaurante merece funcionar con <em>claridad.</em></h1>
          <p className="landing-description">
            Restora está construyendo un espacio para organizar la operación de
            tu restaurante y ayudarte a crecer, un servicio a la vez.
          </p>
          <div className="landing-actions">
            <Link className="primary-button landing-primary" href="/registro">
              Crear mi cuenta <span aria-hidden="true">→</span>
            </Link>
            <Link className="landing-secondary" href="/login">Ya tengo una cuenta</Link>
          </div>
          <p className="landing-caption">Una plataforma pensada para restaurantes de aquí.</p>
        </div>
        <div className="landing-visual" aria-hidden="true">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-center">
            <span className="visual-sparkle">✳</span>
            <span className="visual-wordmark">r</span>
            <span className="visual-caption">cada detalle<br />en su lugar</span>
          </div>
          <div className="visual-pill pill-top">Buen servicio, todos los días</div>
          <div className="visual-pill pill-bottom"><span className="status-dot" />Un buen comienzo</div>
          <span className="visual-star star-one">✳</span>
          <span className="visual-star star-two">✦</span>
        </div>
      </section>
      <footer className="landing-footer">
        <span>Restora <span aria-hidden="true">·</span> Gestión para restaurantes</span>
        <span>Cúcuta, Colombia</span>
      </footer>
    </main>
  );
}
