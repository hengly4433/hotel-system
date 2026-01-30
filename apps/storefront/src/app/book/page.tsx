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
      <div className="card">
        <h2>Missing details</h2>
        <p>Return to search to select dates and a room.</p>
      </div>
    );
  }

  const roomImages =
    roomType?.images && roomType.images.length > 0
      ? [...roomType.images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
      : [];

  return (
    <>
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Confirm your stay</h2>
        <p style={{ color: "rgba(28, 42, 45, 0.7)" }}>
          {roomType?.name || "Selected room"} · {from} → {to}
        </p>
        {roomImages.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Room gallery</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 8
              }}
            >
              {roomImages.map((image, index) => (
                <div
                  key={`${image.url}-${index}`}
                  style={{
                    position: "relative",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: image.isPrimary ? "2px solid #0f172a" : "1px solid rgba(15, 23, 42, 0.12)"
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
                        background: "#0f172a",
                        color: "#fff",
                        padding: "2px 6px",
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
        <div className="card">
          <h3>Your reservation is confirmed</h3>
          <p>
            Confirmation code: <strong>{confirmation.code}</strong>
          </p>
          <p>Status: {confirmation.status}</p>
          <p>
            {confirmation.checkInDate} → {confirmation.checkOutDate}
          </p>
          <p>We have emailed your confirmation to {email}.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid" style={{ gap: 24 }}>
          {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Rate plan</h3>
            {ratePlans.length === 0 ? (
              <p style={{ margin: 0, color: "var(--ink-soft)" }}>
                No rate plans available for these dates. Please choose different dates.
              </p>
            ) : (
              <select
                className="input"
                value={ratePlanId}
                onChange={(event) => setRatePlanId(event.target.value)}
              >
                {ratePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} {plan.refundable ? "· Refundable" : "· Non-refundable"}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="card grid" style={{ gap: 16 }}>
            <h3 style={{ margin: 0 }}>Guest details</h3>
            <div className="two-col">
              <label className="grid" style={{ gap: 6 }}>
                <span>First name</span>
                <input className="input" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
              </label>
              <label className="grid" style={{ gap: 6 }}>
                <span>Last name</span>
                <input className="input" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
              </label>
            </div>
            <div className="two-col">
              <label className="grid" style={{ gap: 6 }}>
                <span>Email</span>
                <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <label className="grid" style={{ gap: 6 }}>
                <span>Phone</span>
                <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>
            </div>
            <label className="grid" style={{ gap: 6 }}>
              <span>Special requests</span>
              <textarea
                className="input"
                rows={3}
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
      <section className="section">
        <div className="container">
          <Suspense fallback={<div className="empty-state">Loading booking...</div>}>
            <BookingContent />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
