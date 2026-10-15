import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";

const slides = [
  {
    image: "/images/hero-burger-mouse.jpg",
    alt: "Vitão com headset, segurando um hambúrguer e um mouse gamer",
    eyebrow: "Lanche na mão, partida aberta",
    title: "Seu intervalo merece sabor de vitória.",
    action: "Escolher meu lanche",
    href: "/lanches",
  },
  {
    image: "/images/gamer-earbuds.jpg",
    alt: "Vitão apresenta fones sem fio usando headset gamer",
    eyebrow: "Tecnologia para o próximo nível",
    title: "Encontre seu próximo parceiro de jogo.",
    action: "Ver periféricos",
    href: "/perifericos",
  },
  {
    image: "/images/burger-fries.jpg",
    alt: "Hambúrguer com bacon, batatas fritas e anéis de cebola",
    eyebrow: "Feito para matar a fome",
    title: "Jogue mais uma. O lanche fica por nossa conta.",
    action: "Ver cardápio",
    href: "/lanches",
  },
];

export default function HomeCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const slide = slides[activeIndex];

  useEffect(() => {
    if (!isPlaying || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  function showSlide(index) {
    setActiveIndex((index + slides.length) % slides.length);
  }

  return <section className="home-carousel" aria-roledescription="carrossel" aria-label="Destaques VGL Show de Bola">
    <img className={`carousel-image carousel-image-${activeIndex + 1}`} src={slide.image} alt={slide.alt} />
    <div className="carousel-shade" aria-hidden="true" />
    <div className={`carousel-copy carousel-copy-${activeIndex + 1}`} aria-live="polite" aria-atomic="true">
      <p className="carousel-eyebrow">{slide.eyebrow}</p>
      <h1>{slide.title}</h1>
      <Link className="btn carousel-action" to={slide.href}>{slide.action}<ArrowRight size={18} aria-hidden="true" /></Link>
    </div>
    <div className="carousel-controls">
      <button type="button" className="carousel-arrow" aria-label="Slide anterior" onClick={() => showSlide(activeIndex - 1)}><ArrowLeft size={20} aria-hidden="true" /></button>
      <div className="carousel-dots" role="group" aria-label="Escolher destaque">
        {slides.map((item, index) => <button key={item.image} className={index === activeIndex ? "carousel-dot active" : "carousel-dot"} type="button" aria-label={`Mostrar slide ${index + 1}: ${item.eyebrow}`} aria-pressed={index === activeIndex} onClick={() => showSlide(index)} />)}
      </div>
      <button type="button" className="carousel-arrow" aria-label={isPlaying ? "Pausar carrossel" : "Retomar carrossel"} onClick={() => setIsPlaying((playing) => !playing)}>{isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}</button>
      <button type="button" className="carousel-arrow" aria-label="Próximo slide" onClick={() => showSlide(activeIndex + 1)}><ArrowRight size={20} aria-hidden="true" /></button>
    </div>
  </section>;
}