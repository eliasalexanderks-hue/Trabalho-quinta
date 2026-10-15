import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Wallet } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  clearCart,
  createMockOrder,
  getCart,
  removeFromCart,
  saveOrder,
  setCartQuantity,
} from "../services/api.js";

const initialValues = { fullName: "", email: "", phone: "", address: "", payment: "", notes: "" };
const paymentLabels = { pix: "Pix", card: "Cartão", cash: "Dinheiro na entrega" };

function validate(values) {
  const errors = {};
  if (values.fullName.trim().length < 3) errors.fullName = "Informe seu nome completo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Informe um e-mail válido.";
  if (values.phone.replace(/\D/g, "").length < 10) errors.phone = "Informe um telefone com DDD.";
  if (values.address.trim().length < 8) errors.address = "Informe um endereço com pelo menos 8 caracteres.";
  if (!values.payment) errors.payment = "Selecione uma forma de pagamento.";
  return errors;
}

function formatPrice(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function CartItem({ item, onQuantityChange, onRemove }) {
  return <li className="cart-item">
    <img src={item.thumbnail} alt="" />
    <div className="cart-item-details">
      <h2>{item.title}</h2>
      <p>{formatPrice(item.price)} cada</p>
      <div className="cart-item-actions">
        <div className="quantity-control" aria-label={`Quantidade de ${item.title}`}>
          <button type="button" aria-label={`Diminuir quantidade de ${item.title}`} onClick={() => onQuantityChange(item.quantity - 1)}>−</button>
          <output aria-live="polite">{item.quantity}</output>
          <button type="button" aria-label={`Aumentar quantidade de ${item.title}`} onClick={() => onQuantityChange(item.quantity + 1)}>+</button>
        </div>
        <button className="text-button" type="button" onClick={onRemove}>Remover</button>
      </div>
    </div>
    <strong className="cart-item-total">{formatPrice(Number(item.price) * item.quantity)}</strong>
  </li>;
}

function OrderSummary({ cart, total }) {
  return <section className="checkout-summary" aria-labelledby="summary-title">
    <h2 id="summary-title">Resumo do pedido</h2>
    <ul className="order-items">
      {cart.map((item) => <li key={item.id}><span>{item.title} <span className="muted">× {item.quantity}</span></span><strong>{formatPrice(item.price * item.quantity)}</strong></li>)}
    </ul>
    <p className="cart-total"><span>Total</span><strong>{formatPrice(total)}</strong></p>
  </section>;
}

export default function Carrinho({ username }) {
  const [cart, setCart] = useState(getCart);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("details");
  const [status, setStatus] = useState("");
  const [apiError, setApiError] = useState("");
  const [pending, setPending] = useState(false);
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const demoPaymentCode = `SHOWDEBOLA|PIX|${username}|${total.toFixed(2)}`;

  function refreshCart() {
    setCart(getCart());
    setStatus("");
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function handleReview(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length && cart.length) setStep("review");
  }

  async function handlePayment() {
    setApiError("");
    setStatus("");
    setPending(true);
    try {
      const response = await createMockOrder(cart, { paymentMethod: values.payment });
      saveOrder(cart, response.id, {
        username,
        paymentMethod: values.payment,
        customer: { fullName: values.fullName.trim(), email: values.email.trim(), phone: values.phone.trim(), address: values.address.trim() },
        notes: values.notes.trim(),
      });
      clearCart();
      setCart([]);
      setStatus("Pedido enviado. Você pode acompanhar a situação em Meus pedidos.");
      setStep("details");
    } catch (error) {
      setApiError(`Não foi possível enviar o pedido: ${error.message}`);
    } finally {
      setPending(false);
    }
  }

  return <>
    <p className="eyebrow">Seu pedido</p>
    <h1>{step === "details" ? "Carrinho" : step === "review" ? "Revisão do pedido" : "Pagamento"}</h1>
    <p className="muted">{step === "details" ? "Confira os itens e informe os dados para entrega." : step === "review" ? "Confira os detalhes antes de continuar para o pagamento." : "Escolha concluída; esta etapa é apenas uma demonstração."}</p>
    <ol className="checkout-steps" aria-label="Etapas do pedido">
      <li className={step === "details" ? "current" : "complete"}>1 <span>Dados</span></li>
      <li className={step === "review" ? "current" : step === "payment" ? "complete" : ""}>2 <span>Revisão</span></li>
      <li className={step === "payment" ? "current" : ""}>3 <span>Pagamento</span></li>
    </ol>
    {apiError && <p className="error" role="alert">{apiError}</p>}
    {status && <p className="ok" role="status" aria-live="polite">{status}</p>}

    {!cart.length ? <section className="empty-cart" aria-labelledby="empty-cart-title">
      <h2 id="empty-cart-title">Seu carrinho está vazio</h2>
      <p>{status || "Adicione lanches ou periféricos para começar seu pedido."}</p>
      <div className="actions"><Link className="btn btn-primary" to="/lanches">Ver lanches</Link><Link className="btn btn-secondary" to="/perifericos">Ver periféricos</Link></div>
    </section> : step === "details" ? <div className="cart-layout">
      <section aria-labelledby="cart-items-title">
        <h2 id="cart-items-title">Itens do pedido</h2>
        <ul className="cart-list">
          {cart.map((item) => <CartItem key={item.id} item={item} onQuantityChange={(quantity) => { setCartQuantity(item.id, quantity); refreshCart(); }} onRemove={() => { removeFromCart(item.id); refreshCart(); }} />)}
        </ul>
        <p className="cart-total"><span>Total</span><strong>{formatPrice(total)}</strong></p>
      </section>
      <section aria-labelledby="checkout-title">
        <h2 id="checkout-title">Dados da entrega</h2>
        <form className="checkout-form" onSubmit={handleReview} noValidate>
          <div className="field"><label htmlFor="fullName">Nome completo</label><input id="fullName" name="fullName" autoComplete="name" value={values.fullName} onChange={handleFieldChange} required minLength={3} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "fullName-error" : undefined} />{errors.fullName && <p className="field-error" id="fullName-error">{errors.fullName}</p>}</div>
          <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleFieldChange} required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />{errors.email && <p className="field-error" id="email-error">{errors.email}</p>}</div>
          <div className="field"><label htmlFor="phone">Telefone com DDD</label><input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={values.phone} onChange={handleFieldChange} required aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} />{errors.phone && <p className="field-error" id="phone-error">{errors.phone}</p>}</div>
          <div className="field"><label htmlFor="address">Endereço de entrega</label><input id="address" name="address" autoComplete="street-address" value={values.address} onChange={handleFieldChange} required minLength={8} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? "address-error" : undefined} />{errors.address && <p className="field-error" id="address-error">{errors.address}</p>}</div>
          <div className="field"><label htmlFor="notes">Observações do pedido <span className="muted">(opcional)</span></label><textarea id="notes" name="notes" rows="3" maxLength={300} value={values.notes} onChange={handleFieldChange} placeholder="Ex.: sem cebola, molho à parte" /></div>
          <fieldset className="payment-options"><legend>Forma de pagamento</legend>
            <label><input type="radio" name="payment" value="pix" checked={values.payment === "pix"} onChange={handleFieldChange} /> Pix</label>
            <label><input type="radio" name="payment" value="card" checked={values.payment === "card"} onChange={handleFieldChange} /> Cartão</label>
            <label><input type="radio" name="payment" value="cash" checked={values.payment === "cash"} onChange={handleFieldChange} /> Dinheiro na entrega</label>
            {errors.payment && <p className="field-error" role="alert">{errors.payment}</p>}
          </fieldset>
          <button className="btn btn-primary" type="submit">Revisar pedido <ArrowRight size={18} aria-hidden="true" /></button>
        </form>
      </section>
    </div> : step === "review" ? <div className="review-layout">
      <OrderSummary cart={cart} total={total} />
      <section className="review-details" aria-labelledby="review-delivery-title">
        <h2 id="review-delivery-title">Entrega e pagamento</h2>
        <dl className="review-list"><div><dt>Recebe</dt><dd>{values.fullName}</dd></div><div><dt>E-mail</dt><dd>{values.email}</dd></div><div><dt>Telefone</dt><dd>{values.phone}</dd></div><div><dt>Endereço</dt><dd>{values.address}</dd></div><div><dt>Pagamento</dt><dd>{paymentLabels[values.payment]}</dd></div><div><dt>Observações</dt><dd>{values.notes || "Nenhuma"}</dd></div></dl>
        <div className="actions review-actions"><button className="btn btn-secondary" type="button" onClick={() => setStep("details")}><ArrowLeft size={18} aria-hidden="true" /> Voltar</button><button className="btn btn-primary" type="button" onClick={() => setStep("payment")}>Continuar para pagamento <ArrowRight size={18} aria-hidden="true" /></button></div>
      </section>
    </div> : <div className="payment-layout">
      <section className="payment-panel" aria-labelledby="payment-title">
        <h2 id="payment-title">{paymentLabels[values.payment]}</h2>
        {values.payment === "pix" && <div className="pix-demo"><QRCodeSVG value={demoPaymentCode} size={190} level="M" aria-label="QR code Pix demonstrativo" /><p>QR code demonstrativo, sem cobrança real.</p><code>{demoPaymentCode}</code><p className="payment-pending">Pagamento aguardando confirmação do administrador.</p></div>}
        {values.payment === "card" && <div className="card-demo"><p className="muted">Dados fictícios para demonstração; não são enviados nem armazenados.</p><div className="field"><label htmlFor="card-name">Nome no cartão</label><input id="card-name" autoComplete="cc-name" placeholder="Nome como aparece no cartão" /></div><div className="field"><label htmlFor="card-number">Número do cartão</label><input id="card-number" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" /></div><div className="card-fields-row"><div className="field"><label htmlFor="card-expiry">Validade</label><input id="card-expiry" autoComplete="cc-exp" placeholder="MM/AA" /></div><div className="field"><label htmlFor="card-cvv">CVV</label><input id="card-cvv" inputMode="numeric" autoComplete="cc-csc" placeholder="000" /></div></div><p className="payment-confirmed">Pagamento demonstrativo confirmado.</p></div>}
        {values.payment === "cash" && <div className="cash-demo"><Wallet size={36} aria-hidden="true" /><p>Pagamento em dinheiro será feito na entrega.</p><p className="payment-pending">Pagamento pendente.</p></div>}
        <div className="actions review-actions"><button className="btn btn-secondary" type="button" onClick={() => setStep("review")}><ArrowLeft size={18} aria-hidden="true" /> Voltar à revisão</button><button className="btn btn-primary" type="button" onClick={handlePayment} disabled={pending}>{pending ? "Enviando pedido..." : "Confirmar pedido"}</button></div>
      </section>
      <OrderSummary cart={cart} total={total} />
    </div>}
  </>;
}
