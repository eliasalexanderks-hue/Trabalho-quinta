import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Lanches from "./pages/Lanches.jsx";
import Perifericos from "./pages/Perifericos.jsx";
import Carrinho from "./pages/Carrinho.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MeusPedidos from "./pages/MeusPedidos.jsx";
import ConfirmarPagamentos from "./pages/ConfirmarPagamentos.jsx";
import Footer from "./components/Footer.jsx";
import { authenticateUser } from "./services/api.js";

const AUTH_KEY = "show-de-bola-authenticated";
const USER_KEY = "show-de-bola-username";
const ROLE_KEY = "show-de-bola-role";
const EMAIL_KEY = "show-de-bola-email";

function ProtectedRoute({ authenticated, children }) {
  const location = useLocation();
  return authenticated ? children : <Navigate to="/login" replace state={{ from: location }} />;
}

export default function App() {
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(AUTH_KEY) === "true");
  const [username, setUsername] = useState(() => sessionStorage.getItem(USER_KEY) || "admin");
  const [role, setRole] = useState(() => sessionStorage.getItem(ROLE_KEY) || "admin");
  const [email, setEmail] = useState(() => sessionStorage.getItem(EMAIL_KEY) || "");

  function login(username, password) {
    const account = authenticateUser(username, password);
    if (!account) return false;
    sessionStorage.setItem(AUTH_KEY, "true");
    sessionStorage.setItem(USER_KEY, account.username);
    sessionStorage.setItem(ROLE_KEY, account.role);
    if (account.email) sessionStorage.setItem(EMAIL_KEY, account.email);
    else sessionStorage.removeItem(EMAIL_KEY);
    setUsername(account.username);
    setRole(account.role);
    setEmail(account.email || "");
    setAuthenticated(true);
    return true;
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(EMAIL_KEY);
    setAuthenticated(false);
  }

  return <>
    {authenticated && <Navbar username={username} email={email} role={role} onLogout={logout} />}
    <main id="conteudo" className={location.pathname === "/" ? "page page-home-layout" : "page"}><Routes>
      <Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <Login onLogin={login} />} />
      <Route path="/cadastro" element={authenticated ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/" element={<ProtectedRoute authenticated={authenticated}><Home /></ProtectedRoute>} />
      <Route path="/lanches" element={<ProtectedRoute authenticated={authenticated}><Lanches /></ProtectedRoute>} />
      <Route path="/perifericos" element={<ProtectedRoute authenticated={authenticated}><Perifericos /></ProtectedRoute>} />
      <Route path="/carrinho" element={<ProtectedRoute authenticated={authenticated}><Carrinho username={username} /></ProtectedRoute>} />
      <Route path="/meus-pedidos" element={<ProtectedRoute authenticated={authenticated}><MeusPedidos role={role} username={username} /></ProtectedRoute>} />
      <Route path="/admin/pagamentos" element={<ProtectedRoute authenticated={authenticated}>{role === "admin" ? <ConfirmarPagamentos /> : <Navigate to="/" replace />}</ProtectedRoute>} />
      <Route path="*" element={<ProtectedRoute authenticated={authenticated}><p>Página não encontrada. <Link to="/">Voltar ao início</Link>.</p></ProtectedRoute>} />
    </Routes></main>
    <Footer />
  </>;
}
