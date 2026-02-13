import { publicApi } from "@/lib/publicApi";
import GalleryClient from "./GalleryClient";

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
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
};

type GalleryPageProps = {
  searchParams?: Promise<{
    propertyId?: string;
  }>;
};

function propertyLabel(property: PropertyOption) {
  const location = [property.city, property.state, property.country].filter(Boolean).join(", ");
  return location ? `${property.name} · ${location}` : property.name;
}

function collectGalleryImages(roomTypes: RoomType[]) {
  const seen = new Set<string>();
  const images: Array<{ url: string; label: string }> = [];
  for (const roomType of roomTypes) {
    if (!roomType.images?.length) continue;
    const sorted = [...roomType.images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
    for (const image of sorted) {
      if (seen.has(image.url)) continue;
      seen.add(image.url);
      images.push({ url: image.url, label: roomType.name });
    }
  }
  return images;
}

export const dynamic = "force-dynamic";

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
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

  const galleryImages = collectGalleryImages(roomTypes);

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero-badge">Visual Journey</span>
          <h1>Gallery</h1>
          <p>A glimpse into our suites, lounges, and shoreline moments.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-center">
            <span className="section-eyebrow">Our Spaces</span>
            <h2 className="section-title centered">Explore The Property</h2>
            <p>Browse through our curated collection of room interiors, resort views, and coastal landscapes.</p>
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
                View Gallery
              </button>
            </form>
          )}
          {galleryImages.length > 0 ? (
            <GalleryClient images={galleryImages} />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📷</div>
              <p style={{ margin: 0 }}>No gallery images available for this property yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
