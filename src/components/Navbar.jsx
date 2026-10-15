import { NavLink } from "react-router-dom";
import { BadgeCheck, ClipboardList, LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCart } from "../services/api.js";

function BrandLogo() {
	const [logoLoaded, setLogoLoaded] = useState(false);
	return <NavLink className="brand" to="/" end aria-label="VGL Show de Bola">
		{!logoLoaded && <span>VGL Show de Bola</span>}
		<img className="brand-logo" src="/images/vgl-show-de-bola.jpeg" alt="" hidden={!logoLoaded} onLoad={() => setLogoLoaded(true)} onError={() => setLogoLoaded(false)} />
	</NavLink>;
}

export default function Navbar({ username, email, role, onLogout }) {
	const [cartCount, setCartCount] = useState(0);
	const [profileOpen, setProfileOpen] = useState(false);
	const [panelPosition, setPanelPosition] = useState({ top: 0, left: 16, width: 288 });
	const profileRef = useRef(null);
	const profileButtonRef = useRef(null);

	useEffect(() => {
		function updateCount() {
			setCartCount(getCart().reduce((total, item) => total + item.quantity, 0));
		}
		updateCount();
		window.addEventListener("cartchange", updateCount);
		window.addEventListener("storage", updateCount);
		return () => {
			window.removeEventListener("cartchange", updateCount);
			window.removeEventListener("storage", updateCount);
		};
	}, []);
	useEffect(() => {
		if (!profileOpen) return;
		function closeOnOutsideClick(event) {
			if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
		}
		function closeOnEscape(event) {
			if (event.key === "Escape") {
				setProfileOpen(false);
				profileButtonRef.current?.focus();
			}
		}
		function closePanel() {
			setProfileOpen(false);
		}
		document.addEventListener("pointerdown", closeOnOutsideClick);
		document.addEventListener("keydown", closeOnEscape);
		window.addEventListener("resize", closePanel);
		window.addEventListener("scroll", closePanel, true);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsideClick);
			document.removeEventListener("keydown", closeOnEscape);
			window.removeEventListener("resize", closePanel);
			window.removeEventListener("scroll", closePanel, true);
		};
	}, [profileOpen]);
	function toggleProfile() {
		if (!profileOpen) {
			const trigger = profileButtonRef.current?.getBoundingClientRect();
			if (trigger) {
				const width = Math.min(288, window.innerWidth - 32);
				const left = Math.max(16, Math.min(trigger.right - width, window.innerWidth - width - 16));
				setPanelPosition({ top: trigger.bottom + 8, left, width });
			}
		}
		setProfileOpen(!profileOpen);
	}

	return <header className="topbar"><a className="skip" href="#conteudo">Pular para o conteúdo</a><nav aria-label="Principal"><BrandLogo /><NavLink to="/" end>Início</NavLink><NavLink to="/lanches">Lanches</NavLink><NavLink to="/perifericos">Periféricos</NavLink><NavLink to="/carrinho" aria-label={`Carrinho, ${cartCount} itens`}>Carrinho <span className="cart-count" aria-hidden="true">{cartCount}</span></NavLink><div className="profile-anchor" ref={profileRef}><button ref={profileButtonRef} className="profile-trigger" type="button" title="Perfil" aria-label="Perfil do usuário" aria-expanded={profileOpen} aria-controls="profile-panel" onClick={toggleProfile}><UserRound size={20} aria-hidden="true" /></button>{profileOpen && <section id="profile-panel" className="profile-panel" style={panelPosition} aria-labelledby="profile-title"><h2 id="profile-title">Perfil</h2><dl className="profile-details"><div><dt>Usuário</dt><dd>{username}</dd></div>{email && <div><dt>E-mail</dt><dd>{email}</dd></div>}<div><dt>Nível de acesso</dt><dd>{role === "admin" ? "Administrador" : "Usuário"}</dd></div><div><dt>Conta</dt><dd>{email ? "Conta registrada" : "Demonstração"}</dd></div></dl><NavLink className="profile-orders-link" to="/meus-pedidos" onClick={() => setProfileOpen(false)}><ClipboardList size={18} aria-hidden="true" />Meus pedidos</NavLink>{role === "admin" && <NavLink className="profile-orders-link" to="/admin/pagamentos" onClick={() => setProfileOpen(false)}><BadgeCheck size={18} aria-hidden="true" />Confirmar pagamentos</NavLink>}<button className="profile-logout" type="button" onClick={onLogout}><LogOut size={18} aria-hidden="true" />Sair</button></section>}</div></nav></header>;
}
