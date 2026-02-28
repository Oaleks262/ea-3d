import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.scss';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Track active section on scroll
  useEffect(() => {
    if (location.pathname !== '/') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = ['hero', 'works', 'about', 'process', 'contact'];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [location]);

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'works', label: 'Роботи' },
    { id: 'about', label: 'Про мене' },
    { id: 'process', label: 'Процес' },
    { id: 'contact', label: 'Контакти' }
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container">
        <div className="navbar__content">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <img src="/logo.png" alt="EA Logo" />
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar__links hide-mobile">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`navbar__link ${
                  activeSection === link.id ? 'navbar__link--active' : ''
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Burger Menu Button */}
          <button
            className={`navbar__burger hide-desktop ${
              mobileMenuOpen ? 'navbar__burger--open' : ''
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`navbar__mobile ${
            mobileMenuOpen ? 'navbar__mobile--open' : ''
          }`}
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`navbar__mobile-link ${
                activeSection === link.id ? 'navbar__mobile-link--active' : ''
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
