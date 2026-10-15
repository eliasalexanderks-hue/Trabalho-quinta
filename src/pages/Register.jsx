import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api.js";

export default function Register() {
  const [values, setValues] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (values.username.trim().length < 3) {
      setError("O usuário precisa ter pelo menos 3 caracteres.");
      return;
    }
    if (values.password.length < 4) {
      setError("A senha precisa ter pelo menos 4 caracteres.");
      return;
    }
    try {
      registerUser({ ...values, username: values.username.trim(), email: values.email.trim() });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (registrationError) {
      setError(registrationError.message);
    }
  }

  return <section className="login-shell" aria-labelledby="register-title">
    <p className="eyebrow">VGL Show de Bola</p>
    <h1 id="register-title">Criar conta</h1>
    <p className="muted">Seu cadastro terá acesso de usuário.</p>
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="register-username">Usuário</label>
        <input id="register-username" name="username" autoComplete="username" minLength={3} value={values.username} onChange={handleChange} required />
      </div>
      <div className="field">
        <label htmlFor="register-email">E-mail</label>
        <input id="register-email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} required />
      </div>
      <div className="field">
        <label htmlFor="register-password">Senha</label>
        <input id="register-password" name="password" type="password" autoComplete="new-password" minLength={4} value={values.password} onChange={handleChange} required />
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit">Criar conta</button>
    </form>
    <p className="login-register-link">Já tem uma conta? <Link to="/login">Entrar</Link></p>
  </section>;
}