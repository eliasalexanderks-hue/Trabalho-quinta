import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { getOrders, updateMockOrder, updateSavedOrder } from "../services/api.js";

function formatPrice(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ConfirmarPagamentos() {
  const [orders, setOrders] = useState(() => getOrders().filter((order) => order.paymentMethod === "pix" && order.paymentStatus === "pending"));
  const [busyOrder, setBusyOrder] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function confirmPayment(order) {
    setBusyOrder(order.id);
    setError("");
    setMessage("");
    try {
      await updateMockOrder(order.items, { paymentStatus: "confirmed" });
      updateSavedOrder(order.id, { paymentStatus: "confirmed" });
      setOrders(getOrders().filter((item) => item.paymentMethod === "pix" && item.paymentStatus === "pending"));
      setMessage(`Pagamento do pedido #${order.id.replace(/\W/g, "").slice(-6).toUpperCase()} confirmado.`);
    } catch (requestError) {
      setError(`Não foi possível confirmar o pagamento: ${requestError.message}`);
    } finally {
      setBusyOrder("");
    }
  }

  return <>
    <p className="eyebrow">Administração</p>
    <h1>Confirmar pagamentos Pix</h1>
    <p className="muted">Confira os pedidos Pix pendentes e confirme o recebimento para liberar a entrega.</p>
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="ok" role="status">{message}</p>}
    {orders.length ? <ul className="orders-list">
      {orders.map((order) => <li className="order-row" key={order.id}>
        <div className="order-header"><div><p className="eyebrow">{order.username || "Conta de demonstração"}</p><h2>Pedido #{order.id.replace(/\W/g, "").slice(-6).toUpperCase()}</h2></div><span className="order-status order-status-pending">Pagamento pendente</span></div>
        <ul className="order-items" aria-label="Itens do pedido">{order.items.map((item, index) => <li key={`${order.id}-${item.id}-${index}`}><span>{item.title} <span className="muted">× {item.quantity}</span></span><strong>{formatPrice(item.price * item.quantity)}</strong></li>)}</ul>
        {order.notes && <p className="order-notes"><strong>Observações:</strong> {order.notes}</p>}
        <div className="order-footer"><span>Total</span><strong>{formatPrice(order.total)}</strong></div>
        <div className="order-actions"><button className="btn btn-primary" type="button" onClick={() => confirmPayment(order)} disabled={Boolean(busyOrder)}><BadgeCheck size={18} aria-hidden="true" />{busyOrder === order.id ? "Confirmando..." : "Confirmar pagamento"}</button></div>
      </li>)}
    </ul> : <section className="empty-orders" aria-live="polite"><h2>Não há pagamentos Pix pendentes</h2><p>Novos pedidos Pix aparecerão aqui para conferência.</p></section>}
  </>;
}