import { useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteMockOrder,
  getOrders,
  updateMockOrder,
  updateSavedOrder,
} from "../services/api.js";

const filters = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "cancelled", label: "Cancelados" },
  { value: "delivered", label: "Entregues" },
];

const statusLabels = {
  pending: "Pendente",
  cancelled: "Cancelado",
  delivered: "Entregue",
};

const paymentStatusLabels = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function OrderItem({ order, onStatusChange, canMarkDelivered }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function changeStatus(status) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (status === "cancelled") {
        await deleteMockOrder();
      } else if (status === "delivered" && canMarkDelivered) {
        await updateMockOrder(order.items, { status, ...(order.paymentMethod === "cash" ? { paymentStatus: "confirmed" } : {}) });
      } else if (status === "payment-confirmed" && canMarkDelivered && order.paymentMethod === "pix") {
        await updateMockOrder(order.items, { paymentStatus: "confirmed" });
      } else {
        return;
      }
      updateSavedOrder(order.id, status === "payment-confirmed"
        ? { paymentStatus: "confirmed" }
        : { status, ...(status === "cancelled" && order.paymentStatus !== "confirmed" ? { paymentStatus: "cancelled" } : {}), ...(status === "delivered" && order.paymentMethod === "cash" ? { paymentStatus: "confirmed" } : {}) });
      onStatusChange();
      setMessage(status === "payment-confirmed" ? "Pagamento Pix confirmado." : `Pedido ${statusLabels[status].toLowerCase()}.`);
    } catch (requestError) {
      setError(`Não foi possível atualizar o pedido: ${requestError.message}`);
    } finally {
      setBusy(false);
    }
  }

  return <li className="order-row">
    <div className="order-header">
      <div>
        <p className="eyebrow">Pedido de {formatDate(order.createdAt)}</p>
        <h2>Pedido #{order.id.replace(/\W/g, "").slice(-6).toUpperCase()}</h2>
      </div>
      <span className={`order-status order-status-${order.status}`}>{statusLabels[order.status] || "Pendente"}</span>
    </div>
    <ul className="order-items" aria-label="Itens do pedido">
      {order.items.map((item, index) => <li key={`${order.id}-${item.id}-${index}`}>
        <span>{item.title} <span className="muted">× {item.quantity}</span></span>
        <strong>{formatPrice(Number(item.price) * item.quantity)}</strong>
      </li>)}
    </ul>
    {order.notes && <p className="order-notes"><strong>Observações:</strong> {order.notes}</p>}
    <div className="order-footer">
      <span>Total</span>
      <strong>{formatPrice(order.total)}</strong>
    </div>
    <div className="order-payment">
      <span>Pagamento: {({ pix: "Pix", card: "Cartão", cash: "Dinheiro na entrega" })[order.paymentMethod] || "Não informado"}</span>
      <strong className={`payment-status payment-status-${order.paymentStatus || "pending"}`}>{paymentStatusLabels[order.paymentStatus] || "Pendente"}</strong>
    </div>
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="ok" role="status">{message}</p>}
    {order.status === "pending" && <div className="order-actions">
      <button className="btn btn-secondary" type="button" onClick={() => changeStatus("cancelled")} disabled={busy}>{busy ? "Atualizando..." : "Cancelar pedido"}</button>
      {canMarkDelivered && order.paymentMethod === "pix" && order.paymentStatus === "pending" && <button className="btn btn-secondary" type="button" onClick={() => changeStatus("payment-confirmed")} disabled={busy}>{busy ? "Atualizando..." : "Confirmar pagamento Pix"}</button>}
      {canMarkDelivered && (order.paymentStatus === "confirmed" || order.paymentMethod === "cash") && <button className="btn btn-primary" type="button" onClick={() => changeStatus("delivered")} disabled={busy}>{busy ? "Atualizando..." : "Marcar como entregue"}</button>}
    </div>}
  </li>;
}

export default function MeusPedidos({ role, username }) {
  const isAdmin = role === "admin";
  const visibleToAccount = (order) => isAdmin || order.username === username;
  const [orders, setOrders] = useState(() => getOrders().filter(visibleToAccount));
  const [filter, setFilter] = useState("all");
  const visibleOrders = orders
    .filter((order) => filter === "all" || order.status === filter)
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

  function refreshOrders() {
    setOrders(getOrders().filter(visibleToAccount));
  }

  return <>
    <p className="eyebrow">Conta</p>
    <h1>Meus pedidos</h1>
    <p className="muted">Acompanhe os pedidos recentes e seus status.</p>
    <div className="order-filters" role="group" aria-label="Filtrar pedidos por status">
      {filters.map((option) => <button key={option.value} className={filter === option.value ? "order-filter active" : "order-filter"} type="button" aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}>{option.label}</button>)}
    </div>
    {visibleOrders.length ? <ul className="orders-list">
      {visibleOrders.map((order) => <OrderItem key={order.id} order={order} onStatusChange={refreshOrders} canMarkDelivered={isAdmin} />)}
    </ul> : <section className="empty-orders" aria-live="polite">
      <h2>{orders.length ? "Nenhum pedido neste status" : "Você ainda não fez pedidos"}</h2>
      <p>{orders.length ? "Escolha outro filtro para consultar seu histórico." : "Seus pedidos finalizados aparecerão aqui."}</p>
      {!orders.length && <Link className="btn btn-primary" to="/lanches">Ver lanches</Link>}
    </section>}
  </>;
}