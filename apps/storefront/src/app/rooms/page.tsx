import { publicApi } from "@/lib/publicApi";

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
  searchParams?: {
    propertyId?: string;
  };
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
  let properties: PropertyOption[] = [];
  let roomTypes: RoomType[] = [];
  let selectedPropertyId = searchParams?.propertyId || "";

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
          <h1>Our Room</h1>
          <p>Hand-finished spaces with layered textures and uninterrupted coastal views.</p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--surface-muted)" }}>
        <div className="container">
          <div className="section-center">
            <h2 className="section-title centered">Stay with us</h2>
            <p>Lorem Ipsum available, but the majority have suffered.</p>
          </div>
          {properties.length > 0 && (
            <form method="GET" className="booking-form booking-form-light" style={{ marginBottom: 32 }}>
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
                  <div key={room.id} className="room-card">
                    {imageUrl ? (
                      <img src={imageUrl} alt={room.name} />
                    ) : (
                      <div className="room-image-placeholder">No image</div>
                    )}
                    <div className="room-card-body">
                      <h3>{room.name}</h3>
                      <p style={{ marginBottom: 0 }}>{room.baseDescription || "Designed for comfort."}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">No rooms are published for this property yet.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
