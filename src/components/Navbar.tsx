export default function Navbar() {
  return (
    <nav className="nav">
      <a href="#top" className="nav__logo" aria-label="Jairus Aragon — home">
        <span className="nav__logo-mark">
          <img src="/logo.png" alt="" />
        </span>
        <span>Jairus Aragon</span>
      </a>
      <div className="nav__links">
        <a className="nav__link nav__link--hide-sm" href="#work">
          Work
        </a>
        <a className="nav__link nav__link--hide-sm" href="#capabilities">
          Skills
        </a>
        <a className="nav__link" href="#contact">
          Contact
        </a>
      </div>
    </nav>
  );
}
