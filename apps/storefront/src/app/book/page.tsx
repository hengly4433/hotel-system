"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { buildAuthHeaders, getCustomerToken } from "@/lib/customerAuth";

type RatePlan = {
  id: string;
  name: string;
  code: string;
  refundable: boolean;
  includesBreakfast: boolean;
};

type RoomType = {
  id: string;
  name: string;
  code: string;
  baseDescription: string | null;
  defaultBedType?: string | null;
  images?: Array<{
    url: string;
    isPrimary: boolean;
  }>;
};

type ReservationResponse = {
  id: string;
  code: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
};

export const dynamic = "force-dynamic";

async function fetchJson<T>(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return (await res.json()) as T;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return dateStr;
  }
}

function BookingContent() {
  const params = useSearchParams();
  const router = useRouter();
  const propertyId = params.get("propertyId") || "";
  const roomTypeId = params.get("roomTypeId") || "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const adults = params.get("adults") || "1";
  const children = params.get("children") || "0";

  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [ratePlanId, setRatePlanId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [confirmation, setConfirmation] = useState<ReservationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectTarget = useMemo(() => {
    const query = params.toString();
    return query ? `/book?${query}` : "/book";
  }, [params]);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      router.push(`/auth/sign-in?redirect=${encodeURIComponent(redirectTarget)}`);
    }
  }, [redirectTarget, router]);

  const loadOptions = useCallback(async () => {
    if (!propertyId || !roomTypeId || !from || !to) {
      return;
    }
    try {
      const [roomTypesData, ratePlansData] = await Promise.all([
        fetchJson<RoomType[]>(`/api/public/room-types?propertyId=${propertyId}`),
        fetchJson<RatePlan[]>(
          `/api/public/rate-plans?propertyId=${propertyId}&roomTypeId=${roomTypeId}&from=${from}&to=${to}`
        )
      ]);
      setRoomType(roomTypesData.find((item) => item.id === roomTypeId) || null);
      setRatePlans(ratePlansData);
      setRatePlanId((current) => {
        if (ratePlansData.length === 0) return "";
        if (current && ratePlansData.some((plan) => plan.id === current)) return current;
        return ratePlansData[0].id;
      });
      setError(null);
      const authHeaders = buildAuthHeaders();
      if (Object.keys(authHeaders).length > 0) {
        try {
          const profile = await fetchJson<{
            firstName: string;
            lastName: string;
            email: string;
            phone: string | null;
          }>("/api/public/auth/me", { headers: authHeaders });
          setFirstName((current) => current || profile.firstName || "");
          setLastName((current) => current || profile.lastName || "");
          setEmail((current) => current || profile.email || "");
          setPhone((current) => current || profile.phone || "");
        } catch (profileErr) {
          router.push(`/auth/sign-in?redirect=${encodeURIComponent(redirectTarget)}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking data");
    }
  }, [propertyId, roomTypeId, from, to, redirectTarget, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOptions();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadOptions]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!ratePlanId) {
      setError("Please select a rate plan.");
      return;
    }
    try {
      const payload = {
        propertyId,
        roomTypeId,
        ratePlanId,
        checkInDate: from,
        checkOutDate: to,
        adults: Number(adults),
        children: Number(children),
        specialRequests: specialRequests || null,
        guest: {
          firstName,
          lastName,
          email,
          phone: phone || null
        }
      };
      const data = await fetchJson<ReservationResponse>("/api/public/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
        body: JSON.stringify(payload)
      });
      setConfirmation(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create reservation";
      const lower = message.toLowerCase();
      if (lower.includes("unauthorized") || lower.includes("auth") || lower.includes("sign in")) {
        router.push(`/auth/sign-in?redirect=${encodeURIComponent(redirectTarget)}`);
        return;
      }
      setError(message);
    }
  }

  if (!propertyId || !roomTypeId || !from || !to) {
    return (
      <div className="empty-state" style={{ maxWidth: 500, margin: "0 auto" }}>
        <div className="empty-state-icon">📋</div>
        <h3 style={{ marginBottom: 8 }}>Missing details</h3>
        <p>Return to search to select dates and a room.</p>
      </div>
    );
  }

  const roomImages =
    roomType?.images && roomType.images.length > 0
      ? [...roomType.images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
      : [];

  // Determine step
  const currentStep = confirmation ? 3 : 1;

  return (
    <>
      {/* Booking Steps */}
      <div className="booking-steps">
        <div className={`booking-step ${currentStep >= 1 ? "active" : ""}`}>
          <span className="booking-step-num">1</span>
          <span className="booking-step-label">Room & Rate</span>
        </div>
        <div className="booking-step-line" />
        <div className={`booking-step ${currentStep >= 2 ? "active" : ""}`}>
          <span className="booking-step-num">2</span>
          <span className="booking-step-label">Guest Details</span>
        </div>
        <div className="booking-step-line" />
        <div className={`booking-step ${currentStep >= 3 ? "active" : ""}`}>
          <span className="booking-step-num">3</span>
          <span className="booking-step-label">Confirmed</span>
        </div>
      </div>

      {/* Room Summary Card */}
      <div className="card booking-summary-card">
        <div className="booking-summary-header">
          <h2 style={{ marginTop: 0, marginBottom: 4 }}>
            {confirmation ? "Booking Complete" : "Confirm your stay"}
          </h2>
          <p style={{ color: "var(--ink-soft)", margin: 0 }}>
            {roomType?.name || "Selected room"} · {formatDate(from)} → {formatDate(to)}
          </p>
        </div>
        {roomImages.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 8
              }}
            >
              {roomImages.slice(0, 4).map((image, index) => (
                <div
                  key={`${image.url}-${index}`}
                  style={{
                    position: "relative",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: image.isPrimary ? "2px solid var(--accent)" : "1px solid var(--border-light)"
                  }}
                >
                  <img
                    src={image.url}
                    alt={`${roomType?.name || "Room"} image ${index + 1}`}
                    style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}
                  />
                  {image.isPrimary && (
                    <span
                      style={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        background: "var(--accent)",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: 8,
                        fontSize: 10,
                        fontWeight: 600
                      }}
                    >
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {confirmation ? (
        <div className="card booking-confirmation-card">
          <div className="booking-confirmation-icon">✓</div>
          <h3>Your reservation is confirmed</h3>
          <div className="booking-confirmation-code">
            <span>Confirmation Code</span>
            <strong>{confirmation.code}</strong>
          </div>
          <div className="booking-confirmation-details">
            <div className="booking-detail-item">
              <span className="booking-detail-label">Status</span>
              <span className="status-pill available">{confirmation.status}</span>
            </div>
            <div className="booking-detail-item">
              <span className="booking-detail-label">Dates</span>
              <span>{formatDate(confirmation.checkInDate)} → {formatDate(confirmation.checkOutDate)}</span>
            </div>
          </div>
          <p style={{ color: "var(--ink-soft)", marginTop: 16 }}>
            We have emailed your confirmation to {email}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid" style={{ gap: 24 }}>
          {error ? <div className="auth-error-modern">{error}</div> : null}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Rate plan</h3>
            {ratePlans.length === 0 ? (
              <p style={{ margin: 0, color: "var(--ink-soft)" }}>
                No rate plans available for these dates. Please choose different dates.
              </p>
            ) : (
              <div className="rate-plan-options">
                {ratePlans.map((plan) => (
                  <label key={plan.id} className={`rate-plan-option ${ratePlanId === plan.id ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="ratePlan"
                      value={plan.id}
                      checked={ratePlanId === plan.id}
                      onChange={() => setRatePlanId(plan.id)}
                    />
                    <div className="rate-plan-info">
                      <strong>{plan.name}</strong>
                      <div className="rate-plan-badges">
                        <span className={`rate-plan-badge ${plan.refundable ? "green" : "amber"}`}>
                          {plan.refundable ? "Refundable" : "Non-refundable"}
                        </span>
                        {plan.includesBreakfast && (
                          <span className="rate-plan-badge green">Breakfast included</span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="card grid" style={{ gap: 16 }}>
            <h3 style={{ margin: 0 }}>Guest details</h3>
            <div className="two-col">
              <label className="grid" style={{ gap: 6 }}>
                <span className="contact-label">First name</span>
                <input className="input" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
              </label>
              <label className="grid" style={{ gap: 6 }}>
                <span className="contact-label">Last name</span>
                <input className="input" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
              </label>
            </div>
            <div className="two-col">
              <label className="grid" style={{ gap: 6 }}>
                <span className="contact-label">Email</span>
                <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <label className="grid" style={{ gap: 6 }}>
                <span className="contact-label">Phone</span>
                <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>
            </div>
            <label className="grid" style={{ gap: 6 }}>
              <span className="contact-label">Special requests</span>
              <textarea
                className="input"
                rows={3}
                placeholder="Any special requests or preferences..."
                value={specialRequests}
                onChange={(event) => setSpecialRequests(event.target.value)}
              />
            </label>
          </div>

          <button className="btn btn-primary" type="submit" disabled={ratePlans.length === 0}>
            Confirm booking
          </button>
        </form>
      )}
    </>
  );
}

export default function BookingPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero-badge">Book Your Stay</span>
          <h1>Reservation</h1>
          <p>Complete your booking in just a few simple steps.</p>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <Suspense fallback={<div className="empty-state">Loading booking...</div>}>
            <BookingContent />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
