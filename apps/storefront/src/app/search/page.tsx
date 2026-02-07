import Link from "next/link";
import { publicApi } from "@/lib/publicApi";

type RoomType = {
  id: string;
  propertyId: string;
  code: string;
  name: string;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  baseDescription: string | null;
  defaultBedType: string | null;
  images?: Array<{
    url: string;
    isPrimary: boolean;
  }>;
};

type AvailabilityDate = {
  date: string;
  reserved: number;
  available: number;
};

type RoomTypeAvailability = {
  roomTypeId: string;
  code: string;
  name: string;
  totalRooms: number;
  dates: AvailabilityDate[];
};

type SearchParams = {
  propertyId?: string;
  from?: string;
  to?: string;
  adults?: string;
  children?: string;
};

function minAvailability(dates: AvailabilityDate[]) {
  if (!dates.length) return 0;
  return dates.reduce((min, entry) => Math.min(min, entry.available), dates[0].available);
}

function primaryImage(room: RoomType) {
  if (!room.images || room.images.length === 0) return null;
  const primary = room.images.find((image) => image.isPrimary);
  return (primary || room.images[0]).url;
}

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const propertyId = params.propertyId || "";
  const from = params.from || "";
  const to = params.to || "";
  const adults = params.adults || "1";
  const children = params.children || "0";

  if (!propertyId || !from || !to) {
    return (
      <main>
        <section className="section">
          <div className="container">
            <div className="card">
              <h2>Missing search details</h2>
              <p>Please go back and enter your property, check-in, and check-out dates.</p>
              <Link className="btn btn-primary" href="/">
                Back to search
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  let roomTypes: RoomType[] = [];
  let availability: RoomTypeAvailability[] = [];
  try {
    [roomTypes, availability] = await Promise.all([
      publicApi<RoomType[]>(`/public/room-types?propertyId=${propertyId}`),
      publicApi<RoomTypeAvailability[]>(
        `/public/availability?propertyId=${propertyId}&from=${from}&to=${to}`
      )
    ]);
  } catch (err) {
    return (
      <main>
        <section className="section">
          <div className="container">
            <div className="card">
              <h2>Unable to load availability</h2>
              <p>Please verify the property ID and try again.</p>
              <Link className="btn btn-primary" href="/">
                Back to search
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const availabilityMap = new Map(availability.map((item) => [item.roomTypeId, item]));

  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ marginTop: 0 }}>Available stays</h2>
            <p style={{ color: "var(--ink-soft)" }}>
              {from} → {to} · {adults} adults, {children} children
            </p>
          </div>

          {roomTypes.length > 0 ? (
            <div className="results-grid">
              {roomTypes.map((room) => {
                const availabilityItem = availabilityMap.get(room.id);
                const minAvailable = availabilityItem ? minAvailability(availabilityItem.dates) : 0;
                const isAvailable = minAvailable > 0;
                const imageUrl = primaryImage(room);
            return (
              <div key={room.id} className="result-card">
                    {imageUrl ? (
                      <img src={imageUrl} alt={room.name} className="result-image" />
                    ) : (
                      <div className="result-image placeholder">No image</div>
                    )}
                <div className="result-body">
                      <div className="result-header">
                        <h3>{room.name}</h3>
                        <span className="result-code">{room.code}</span>
                      </div>
                      <p>{room.baseDescription || "A curated room with coastal light and quiet comfort."}</p>
                      <div className="result-meta">
                        <span>
                          Sleeps up to {room.maxOccupancy} · {room.defaultBedType || "Signature bed"}
                        </span>
                        <span className={isAvailable ? "status-pill available" : "status-pill sold"}>
                          {isAvailable ? `${minAvailable} rooms left` : "Unavailable"}
                        </span>
                      </div>
                  {isAvailable ? (
                    <Link
                      className="btn btn-primary"
                      href={`/book?propertyId=${propertyId}&roomTypeId=${room.id}&from=${from}&to=${to}&adults=${adults}&children=${children}`}
                    >
                      Book this room
                    </Link>
                  ) : (
                    <button className="btn btn-disabled" type="button" disabled>
                      Unavailable
                    </button>
                  )}
                </div>
              </div>
            );
          })}
            </div>
          ) : (
            <div className="empty-state">No room types are available for this property yet.</div>
          )}
        </div>
      </section>
    </main>
  );
}
