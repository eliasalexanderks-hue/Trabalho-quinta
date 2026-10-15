import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    if (onLogin(username.trim(), password)) {
      navigate(location.state?.from?.pathname || "/", { replace: true });
      return;
    }
    setError("Usuário ou senha incorretos.");
  }

  return <section className="login-shell" aria-labelledby="login-title">
    <p className="eyebrow">VGL Show de Bola</p>
    <h1 id="login-title">Entrar</h1>
    <p className="muted">Acesse a loja com sua conta de demonstração.</p>
    {location.state?.registered && <p className="ok" role="status">Conta criada. Entre com seu usuário e senha.</p>}
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="login-username">Usuário</label>
        <input id="login-username" name="username" autoComplete="username" value={username} onChange={(event) => { setUsername(event.target.value); setError(""); }} required aria-describedby={error ? "login-error" : undefined} />
      </div>
      <div className="field">
        <label htmlFor="login-password">Senha</label>
        <input id="login-password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} required aria-describedby={error ? "login-error" : undefined} />
      </div>
      {error && <p className="error" id="login-error" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit">Entrar</button>
    </form>
    <p className="login-register-link">Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
    <div className="demo-credentials"><p>Acesso administrador: <code>admin</code> / <code>admin</code></p><p>Acesso usuário: <code>teste</code> / <code>teste</code></p></div>
    <p className="login-note">Login apenas demonstrativo; não use esta autenticação em produção.</p>
  </section>;
}