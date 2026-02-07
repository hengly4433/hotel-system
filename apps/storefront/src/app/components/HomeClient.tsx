"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
// import { BLOGS } from "@/app/content/marketing"; // Removed as now unused
import DatePicker from "@/app/components/DatePicker";

type PropertyOption = {
  id: string;
  name: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

type RoomTypeImage = {
  url: string;
  isPrimary: boolean;
};

type RoomType = {
  id: string;
  propertyId: string;
  name: string;
  baseDescription: string | null;
  images: RoomTypeImage[];
};

type Blog = {
  id: string;
  title: string;
  tag: string;
  description: string;
  imageUrl: string;
  content: string;
  isActive: boolean;
  createdAt: string;
};

type PageContent = {
  id: string;
  sectionKey: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

type HomeClientProps = {
  properties: PropertyOption[];
  roomTypes?: RoomType[];
  galleryImages?: string[];
  blogs?: Blog[];
  pageContents?: PageContent[];
  hasPropertyError?: boolean;
};

const today = new Date().toISOString().slice(0, 10);

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

function collectGalleryImages(roomTypes: RoomType[]) {
  const seen = new Set<string>();
  const images: string[] = [];
  for (const roomType of roomTypes) {
    if (!roomType.images?.length) continue;
    const sorted = [...roomType.images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
    for (const image of sorted) {
      if (seen.has(image.url)) continue;
      seen.add(image.url);
      images.push(image.url);
    }
  }
  return images;
}

async function fetchPublic<T>(path: string) {
  const res = await fetch(`/api/public${path}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return (await res.json()) as T;
}

export default function HomeClient({
  properties,
  roomTypes: initialRoomTypes = [],
  galleryImages: initialGalleryImages = [],
  blogs = [],
  pageContents = [],
  hasPropertyError
}: HomeClientProps) {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState("");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(initialRoomTypes);
  const [galleryImages, setGalleryImages] = useState<string[]>(initialGalleryImages);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  // Helper to get section content
  const getContent = (key: string) => pageContents.find((c) => c.sectionKey === key);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    
    // Debug logging
    console.log("[BookingForm] Submit triggered");
    console.log("[BookingForm] State values:", { propertyId, from, to, adults, children });
    
    if (!propertyId || !from || !to) {
      console.warn("[BookingForm] Missing required fields:", {
        propertyId: propertyId || "(empty)",
        from: from || "(empty)",
        to: to || "(empty)"
      });
      alert(`Missing required fields:\n${!propertyId ? "• Property\n" : ""}${!from ? "• Arrival date\n" : ""}${!to ? "• Departure date" : ""}`);
      return;
    }
    
    const params = new URLSearchParams({
      propertyId,
      from,
      to,
      adults,
      children
    });
    const url = `/search?${params.toString()}`;
    console.log("[BookingForm] Navigating to:", url);
    router.push(url);
  }

  useEffect(() => {
    if (!propertyId && properties[0]?.id) {
      setPropertyId(properties[0].id);
    }
  }, [properties, propertyId]);

  useEffect(() => {
    if (!propertyId) {
      setRoomTypes([]);
      setGalleryImages([]);
      return;
    }
    let active = true;
    setRoomLoading(true);
    setRoomError(null);
    fetchPublic<RoomType[]>(`/room-types?propertyId=${propertyId}`)
      .then((data) => {
        if (!active) return;
        setRoomTypes(data);
        setGalleryImages(collectGalleryImages(data));
      })
      .catch((err) => {
        if (!active) return;
        setRoomTypes([]);
        setGalleryImages([]);
        setRoomError(err instanceof Error ? err.message : "Unable to load rooms");
      })
      .finally(() => {
        if (!active) return;
        setRoomLoading(false);
      });
    return () => {
      active = false;
    };
  }, [propertyId]);

  const visibleGalleryImages = useMemo(() => galleryImages.slice(0, 8), [galleryImages]);

  const roomsContent = getContent("home.rooms");
  const galleryContent = getContent("home.gallery");
  const blogContent = getContent("home.blog");
  const contactContent = getContent("home.contact");

  return (
    <main>
      <section id="home" className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="container hero-inner">
          <div className="hero-card" id="booking">
            <h2>Book a room online</h2>
            <form className="booking-form" onSubmit={handleSubmit}>
              <label>
                Hotel / Property
                {properties.length > 0 ? (
                  <select
                    value={propertyId}
                    onChange={(event) => setPropertyId(event.target.value)}
                    required
                  >
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {propertyLabel(property)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={propertyId}
                    onChange={(event) => setPropertyId(event.target.value)}
                    placeholder="Enter property id"
                    required
                  />
                )}
                {hasPropertyError ? (
                  <span style={{ color: "var(--sun)", fontSize: 12 }}>
                    Unable to load properties. You can still search by ID.
                  </span>
                ) : null}
              </label>
              <div className="booking-row">
                <label>
                  Arrival
                  <DatePicker value={from} onChange={(value) => setFrom(value)} required minDate={today} />
                </label>
                <label>
                  Departure
                  <DatePicker value={to} onChange={(value) => setTo(value)} required minDate={from || today} />
                </label>
              </div>
              <div className="booking-row">
                <label>
                  Adults
                  <select value={adults} onChange={(event) => setAdults(event.target.value)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </label>
                <label>
                  Children
                  <select value={children} onChange={(event) => setChildren(event.target.value)}>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </label>
              </div>
              <button className="btn btn-primary" type="submit">
                Book Now
              </button>
            </form>
          </div>
          <div className="hero-copy">
            <span style={{ textTransform: "uppercase", letterSpacing: "0.3em", fontSize: "0.8rem" }}>
              Coastal Retreat
            </span>
            <h1>A quieter kind of luxury.</h1>
            <p>
              Curated rooms, slow mornings, and thoughtful service right by the harbor. Discover spaces designed for
              stillness, soft light, and a view worth lingering over.
            </p>
            <Link className="btn btn-outline" href="/#rooms">
              Explore Rooms
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="section">
        <div className="container about-grid">
          <div>
            <h2 className="section-title">About Us</h2>
            <p>
              Harborlight is a coastal hideaway built for unrushed days. Our suites pair warm natural materials with
              crisp, modern comforts, while the shoreline sets the rhythm for mornings, meals, and evenings.
            </p>
            <p>
              From sunrise coffee on the terrace to twilight dips in the pool, we craft small moments that make a stay
              feel personal.
            </p>
            <button className="btn btn-dark" type="button">
              Read More
            </button>
          </div>
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop"
              alt="Harborlight Resort"
            />
          </div>
        </div>
      </section>

      <section id="rooms" className="section" style={{ background: "var(--surface-muted)" }}>
        <div className="container">
          <div className="section-center">
            <h2 className="section-title centered">{roomsContent?.title || "Our Room"}</h2>
            <p>{roomsContent?.description || "Hand-finished spaces with layered textures and uninterrupted coastal views."}</p>
          </div>
          <div className="room-grid">
            {roomLoading ? (
              <div className="empty-state">Loading rooms…</div>
            ) : roomTypes.length > 0 ? (
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
              <div className="empty-state">
                {roomError ? roomError : "No rooms are published for this property yet."}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="gallery" className="section">
        <div className="container">
          <div className="section-center">
            <h2 className="section-title centered">{galleryContent?.title || "Gallery"}</h2>
            <p>{galleryContent?.description || "Wander through the moments that define our shoreline story."}</p>
          </div>
          {visibleGalleryImages.length > 0 ? (
            <div className="gallery-grid">
              {visibleGalleryImages.map((image, index) => (
                <div key={`gallery-${index}`} className="gallery-item">
                  <img src={image} alt={`Room gallery ${index + 1}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No gallery images available yet.</div>
          )}
        </div>
      </section>

      <section id="blog" className="section blog-section">
        <div className="container">
          <div className="section-center" style={{ marginBottom: 32 }}>
            <h2 className="section-title centered">{blogContent?.title || "Blog"}</h2>
            <p>{blogContent?.description || "Stories, rituals, and seasonal notes."}</p>
          </div>
          {blogs.length > 0 ? (
            <div className="blog-grid">
              {blogs.map((blog, index) => (
                <article key={`${blog.title}-${index}`} className="blog-card">
                  <img src={blog.imageUrl} alt={blog.title} />
                  <div className="blog-body">
                    <h3>{blog.title}</h3>
                    <span className="tag">{blog.tag}</span>
                    <p>{blog.description}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">No blog posts available yet.</div>
          )}
        </div>
      </section>

      <section id="contact" className="section">
        <div className="container">
          <div className="section-center" style={{ marginBottom: 32 }}>
            <h2 className="section-title centered">{contactContent?.title || "Contact Us"}</h2>
            {contactContent?.description && <p>{contactContent.description}</p>}
          </div>
          <div className="contact-grid">
            <div className="contact-card">
              <label className="grid" style={{ gap: 8 }}>
                Name
                <input className="input" placeholder="Name" />
              </label>
              <label className="grid" style={{ gap: 8 }}>
                Email
                <input className="input" placeholder="Email" type="email" />
              </label>
              <label className="grid" style={{ gap: 8 }}>
                Phone Number
                <input className="input" placeholder="Phone Number" />
              </label>
              <label className="grid" style={{ gap: 8 }}>
                Message
                <textarea className="input" rows={4} placeholder="Message" />
              </label>
              <button className="btn btn-dark" type="button">
                Send
              </button>
            </div>
            <div className="contact-map">
              <iframe
                title="Harborlight map"
                src="https://maps.google.com/maps?q=eiffel%20tower&t=&z=13&ie=UTF8&iwloc=&output=embed"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
