import { Link } from "react-router-dom";

export default function Footer() {
	return <footer className="site-footer">
		<div className="site-footer-main">
			<div className="site-footer-brand">
				<img src="/images/vgl-show-de-bola.jpeg" alt="VGL Show de Bola" />
				<p>Lanches e tecnologia no mesmo lugar. Sua próxima pausa começa aqui.</p>
			</div>
			<div className="site-footer-column">
				<h2>Explore</h2>
				<Link to="/">Início</Link>
				<Link to="/lanches">Lanches</Link>
				<Link to="/perifericos">Periféricos</Link>
			</div>
			<div className="site-footer-column">
				<h2>Sua conta</h2>
				<Link to="/carrinho">Carrinho</Link>
				<Link to="/meus-pedidos">Meus pedidos</Link>
			</div>
		</div>
		<div className="site-footer-bottom"><span>© {new Date().getFullYear()} VGL Show de Bola</span><Link to="/">Voltar ao início ↑</Link></div>
	</footer>;
}