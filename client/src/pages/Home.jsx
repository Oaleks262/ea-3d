import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { settingsAPI } from '../utils/api';
import Cursor from '../components/Cursor/Cursor';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import Works from '../components/Works/Works';
import Process from '../components/Process/Process';
import Contact from '../components/Contact/Contact';
import Footer from '../components/Footer/Footer';

function Home() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Єлизавета Антонюк — 3D Аніматор & Motion Дизайнер</title>
        <meta
          name="description"
          content="Преміальне портфоліо 3D анімації та motion дизайну. Створюю високоякісні візуальні рішення для брендів та агенцій."
        />
      </Helmet>

      <Cursor />
      <Navbar />
      <Hero settings={settings} />
      <Works />
      <About settings={settings} />
      <Process />
      <Contact />
      <Footer />
    </>
  );
}

export default Home;
