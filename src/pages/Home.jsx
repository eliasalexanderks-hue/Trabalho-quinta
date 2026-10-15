import { Link } from "react-router-dom";
import HomeCarousel from "../components/HomeCarousel.jsx";
import { foodProducts } from "../services/api.js";

const homeCategories = [
	{ title: "Lanches", image: "/images/burger-portrait.jpg", alt: "Vitão segurando um hambúrguer", href: "/lanches" },
	{ title: "Combos", image: "/images/burger-fries.jpg", alt: "Hambúrguer acompanhado de batatas fritas", href: "/lanches" },
	{ title: "Porções", image: "/images/burger-bite.jpg", alt: "Lanche servido com acompanhamentos", href: "/lanches" },
	{ title: "Bebidas", image: "/images/milkshake.jpg", alt: "Milk-shake de chocolate", href: "/lanches" },
	{ title: "Periféricos", image: "/images/smartwatch-gamer.jpg", alt: "Vitão mostrando um relógio inteligente", href: "/perifericos" },
];

export default function Home() {
	return <div className="home-page">
		<HomeCarousel />
		<section className="home-intro">
			<p className="eyebrow">Lanches e tecnologia no mesmo lugar</p>
			<h2>Seu rolê merece VGL Show de Bola.</h2>
			<p>Escolha um lanche caprichado ou encontre o periférico para elevar sua jogatina.</p>
			<div className="actions"><Link className="btn btn-primary" to="/lanches">Ver lanches</Link><Link className="btn btn-secondary" to="/perifericos">Ver periféricos</Link></div>
		</section>
		<section className="home-categories home-container" aria-labelledby="categorias-titulo">
			<div className="home-section-heading"><div><p className="eyebrow">Explore o nosso menu</p><h2 id="categorias-titulo">Algo para cada vontade</h2></div><Link className="home-text-link" to="/lanches">Ver cardápio <span aria-hidden="true">→</span></Link></div>
			<div className="home-category-row">
				{homeCategories.map((category) => <Link className="home-category" to={category.href} key={category.title}>
					<img src={category.image} alt={category.alt} />
					<span>{category.title}</span>
				</Link>)}
			</div>
		</section>
		<section className="home-menu" aria-labelledby="favoritos-titulo">
			<div className="home-container">
				<div className="home-section-heading home-section-heading-dark"><div><p className="eyebrow">Feitos para a sua pausa</p><h2 id="favoritos-titulo">Favoritos da galera</h2></div><Link className="home-text-link" to="/lanches">Ver cardápio <span aria-hidden="true">→</span></Link></div>
				<div className="home-menu-grid">
					{foodProducts.slice(0, 4).map((product) => <Link className="home-menu-card" to="/lanches" key={product.id}>
						<img src={product.thumbnail} alt={product.title} />
						<div className="home-menu-card-copy"><p className="eyebrow">{product.category}</p><h3>{product.title}</h3><p>{product.description}</p><strong>{product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></div>
					</Link>)}
				</div>
			</div>
		</section>
		<section className="home-pillars home-container" aria-label="O que você encontra na VGL">
			<div><span className="home-pillar-mark" aria-hidden="true">01</span><h3>Uma pausa com sabor</h3><p>Lanches para acompanhar qualquer partida.</p></div>
			<div><span className="home-pillar-mark" aria-hidden="true">02</span><h3>Seu setup, seu estilo</h3><p>Periféricos para deixar a jogatina completa.</p></div>
			<div><span className="home-pillar-mark" aria-hidden="true">03</span><h3>Tudo no mesmo lugar</h3><p>Escolha, adicione ao carrinho e acompanhe seus pedidos.</p></div>
		</section>
		<section className="home-story" aria-labelledby="home-story-title">
			<div className="home-story-image"><img src="/images/vitao.jpeg" alt="Vitão com lanches e produtos para jogar" /></div>
			<div className="home-story-copy"><p className="eyebrow">VGL Show de Bola</p><h2 id="home-story-title">Mais que um lanche. Seu próximo round.</h2><p>Junte o que deixa a sua pausa melhor: um lanche caprichado e aquele equipamento que combina com o seu jeito de jogar.</p><Link className="home-text-link" to="/perifericos">Conheça os periféricos <span aria-hidden="true">→</span></Link></div>
		</section>
	</div>;
}
