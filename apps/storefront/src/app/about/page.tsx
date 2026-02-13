import Link from "next/link";
import { publicApi } from "@/lib/publicApi";

type PropertyOption = {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
};

type RoomType = {
  id: string;
  name: string;
  baseDescription: string | null;
  defaultBedType: string | null;
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
};

type AboutPageProps = {
  searchParams?: Promise<{
    propertyId?: string;
  }>;
};

function propertyLabel(property: PropertyOption) {
  const location = [property.city, property.state, property.country].filter(Boolean).join(", ");
  return location ? `${property.name} · ${location}` : property.name;
}

function primaryImage(roomType: RoomType) {
  if (roomType.images?.length) {
    const primary = roomType.images.find((image) => image.isPrimary);
    return (primary || roomType.images[0]).url;
  }
  return null;
}

export const dynamic = "force-dynamic";

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const params = await (searchParams ?? Promise.resolve({}));
  let properties: PropertyOption[] = [];
  let roomTypes: RoomType[] = [];
  let selectedPropertyId = (params as { propertyId?: string }).propertyId || "";

  try {
    properties = await publicApi<PropertyOption[]>("/public/properties");
    if (!selectedPropertyId && properties.length > 0) {
      selectedPropertyId = properties[0].id;
    }
  } catch (err) {
    properties = [];
  }

  if (selectedPropertyId) {
    try {
      roomTypes = await publicApi<RoomType[]>(
        `/public/room-types?propertyId=${encodeURIComponent(selectedPropertyId)}`
      );
    } catch (err) {
      roomTypes = [];
    }
  }

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero-badge">Discover Our Story</span>
          <h1>About Us</h1>
          <p>Harborlight is a coastal sanctuary for slow mornings, thoughtful design, and restorative stays.</p>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div>
            <span className="section-eyebrow">Our Story</span>
            <h2 className="section-title">A Retreat By The Tides</h2>
            <p>
              Harborlight began as a seaside retreat built around the rhythm of the tides. Every suite pairs warm
              textures with coastal light, offering a calm place to return to after long walks, lively dinners, and
              late-night conversations.
            </p>
            <p>
              Our team curates each stay with quiet intention: locally inspired cuisine, personal concierge service, and
              spaces that invite you to linger.
            </p>
            <div className="about-stats">
              <div className="about-stat">
                <span className="about-stat-number">50+</span>
                <span className="about-stat-label">Curated Rooms</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-number">12</span>
                <span className="about-stat-label">Years of Service</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-number">4.9</span>
                <span className="about-stat-label">Guest Rating</span>
              </div>
            </div>
            <Link href="/rooms" className="btn btn-dark">
              Explore Our Rooms
            </Link>
          </div>
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop"
              alt="Harborlight resort"
            />
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--surface-muted)" }}>
        <div className="container">
          <div className="section-center">
            <span className="section-eyebrow">Accommodations</span>
            <h2 className="section-title centered">Signature Rooms</h2>
            <p>Hand-finished spaces with layered textures and uninterrupted coastal views.</p>
          </div>
          {properties.length > 0 && (
            <form method="GET" className="booking-form booking-form-light property-filter-form">
              <label>
                Property
                <select name="propertyId" defaultValue={selectedPropertyId} required>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {propertyLabel(property)}
                    </option>
                  ))}
                </select>
              </label>
              <button className="btn btn-dark" type="submit">
                View Rooms
              </button>
            </form>
          )}
          <div className="room-grid">
            {roomTypes.length > 0 ? (
              roomTypes.slice(0, 3).map((room) => {
                const imageUrl = primaryImage(room);
                return (
                  <div key={room.id} className="room-card">
                    {imageUrl ? (
                      <img src={imageUrl} alt={room.name} />
                    ) : (
                      <div className="room-image-placeholder">No image</div>
                    )}
                    <div className="room-card-body">
                      {room.defaultBedType && (
                        <span className="room-badge">{room.defaultBedType}</span>
                      )}
                      <h3>{room.name}</h3>
                      <p style={{ marginBottom: 0 }}>{room.baseDescription || "Designed for comfort."}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🏨</div>
                <p style={{ margin: 0 }}>No rooms are published for this property yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
