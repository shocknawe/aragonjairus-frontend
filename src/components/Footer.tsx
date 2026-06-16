export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>© {year} Jairus Aragon</span>
        <span>Designed &amp; built in the browser</span>
        <div className="footer__links">
          <a href="https://www.linkedin.com/in/aragonjairus/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="mailto:jairus.aragon@gmail.com">Email</a>
        </div>
      </div>
    </footer>
  );
}
