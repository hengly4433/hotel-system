"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";

const EMPTY_ITEM = {
  type: "ROOM_CHARGE",
  description: "",
  qty: 1,
  unitPrice: 0
};

const EMPTY_PAYMENT = {
  method: "CARD",
  amount: 0,
  currency: "USD",
  status: "CAPTURED",
  provider: "",
  providerRef: "",
  idempotencyKey: ""
};

export default function FolioDetailPage() {
  const params = useParams();
  const folioId = params?.id as string | undefined;

  const [folio, setFolio] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!folioId) return;
    try {
      const data = await apiJson<any>(`folios/${folioId}`);
      setFolio(data);
      setItems(data.items || []);
      setPayments(data.payments || []);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [folioId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  async function addItem() {
    if (!folioId) return;
    setError(null);
    try {
      await apiJson(`folios/${folioId}/items`, {
        method: "POST",
        body: JSON.stringify(itemForm)
      });
      setItemForm(EMPTY_ITEM);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function addPayment() {
    if (!folioId) return;
    setError(null);
    try {
      await apiJson(`folios/${folioId}/payments`, {
        method: "POST",
        body: JSON.stringify(paymentForm)
      });
      setPaymentForm(EMPTY_PAYMENT);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function closeFolio() {
    if (!folioId) return;
    setError(null);
    try {
      await apiJson(`folios/${folioId}/close`, { method: "POST" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <main>
      <PageHeader title="Folio Detail" subtitle={folioId || ""} />
      {error ? <div style={{ color: "#b91c1c", marginBottom: 16 }}>{error}</div> : null}
      {folio ? (
        <div style={{ background: "white", padding: 24, borderRadius: 10, marginBottom: 24 }}>
          <div>Status: {folio.status}</div>
          <div>Reservation: {folio.reservationId}</div>
          <button onClick={closeFolio} style={{ marginTop: 12 }}>
            Close Folio
          </button>
        </div>
      ) : null}

      <section style={{ background: "white", padding: 24, borderRadius: 10, marginBottom: 24 }}>
        <h3>Add Item</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            <div>Type</div>
            <input
              value={itemForm.type}
              onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
            />
          </label>
          <label>
            <div>Description</div>
            <input
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
            />
          </label>
          <label>
            <div>Qty</div>
            <input
              type="number"
              value={itemForm.qty}
              onChange={(e) => setItemForm({ ...itemForm, qty: Number(e.target.value) })}
            />
          </label>
          <label>
            <div>Unit Price</div>
            <input
              type="number"
              value={itemForm.unitPrice}
              onChange={(e) => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) })}
            />
          </label>
        </div>
        <button onClick={addItem} style={{ marginTop: 12 }}>
          Add Item
        </button>
      </section>

      <section style={{ background: "white", padding: 24, borderRadius: 10, marginBottom: 24 }}>
        <h3>Add Payment</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            <div>Method</div>
            <input
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
            />
          </label>
          <label>
            <div>Amount</div>
            <input
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
            />
          </label>
          <label>
            <div>Currency</div>
            <input
              value={paymentForm.currency}
              onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })}
            />
          </label>
          <label>
            <div>Status</div>
            <input
              value={paymentForm.status}
              onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
            />
          </label>
          <label>
            <div>Provider</div>
            <input
              value={paymentForm.provider}
              onChange={(e) => setPaymentForm({ ...paymentForm, provider: e.target.value })}
            />
          </label>
          <label>
            <div>Provider Ref</div>
            <input
              value={paymentForm.providerRef}
              onChange={(e) => setPaymentForm({ ...paymentForm, providerRef: e.target.value })}
            />
          </label>
          <label>
            <div>Idempotency Key</div>
            <input
              value={paymentForm.idempotencyKey}
              onChange={(e) => setPaymentForm({ ...paymentForm, idempotencyKey: e.target.value })}
            />
          </label>
        </div>
        <button onClick={addPayment} style={{ marginTop: 12 }}>
          Add Payment
        </button>
      </section>

      <section style={{ background: "white", padding: 24, borderRadius: 10 }}>
        <h3>Items</h3>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.type} - {item.description} - {item.amount}
            </li>
          ))}
        </ul>
        <h3>Payments</h3>
        <ul>
          {payments.map((payment) => (
            <li key={payment.id}>
              {payment.method} - {payment.amount} - {payment.status}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
