import { publicApi } from "@/lib/publicApi";
import Link from "next/link";
import styles from "./page.module.css";

type PropertyOption = {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
};

type RoomTypeImage = {
  url: string;
  isPrimary: boolean;
};

type RoomType = {
  id: string;
  propertyId: string;
  code: string;
  name: string;
  baseDescription: string | null;
  defaultBedType: string | null;
  images: RoomTypeImage[];
};

type RoomsPageProps = {
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

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
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
          <span className="page-hero-badge">Accommodations</span>
          <h1>Our Rooms</h1>
          <p>Hand-finished spaces with layered textures and uninterrupted coastal views.</p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--surface-muted)" }}>
        <div className="container">
          <div className="section-center">
            <span className="section-eyebrow">Stay With Us</span>
            <h2 className="section-title centered">Find Your Perfect Room</h2>
            <p>Each room is thoughtfully designed with natural materials, soft lighting, and panoramic views of the coast.</p>
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
              roomTypes.map((room) => {
                const imageUrl = primaryImage(room);
                return (
                  <Link key={room.id} href={`/rooms/${room.id}`} className={styles.roomCardLink}>
                    <div className="room-card">
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
                  </Link>
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
