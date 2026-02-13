import { publicApi } from "@/lib/publicApi";
import GalleryClient from "../../gallery/GalleryClient";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  maxOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  images: RoomTypeImage[];
};

type RoomDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  let room: RoomType | null = null;

  try {
    room = await publicApi<RoomType>(`/public/room-types/${id}`);
  } catch (err) {
    console.error("Failed to fetch room type", err);
  }

  if (!room) {
    notFound();
  }

  const galleryImages = room.images.map((img) => ({
    url: img.url,
    label: room!.name, // we know room is not null here
  }));

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <Link href="/rooms" className="back-link">
            ← Back to Rooms
          </Link>
          <h1>{room.name}</h1>
          <p className="hero-subtitle">{room.baseDescription}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="room-detail-grid">
            <div className="room-info">
              <div className="info-card">
                <h3>Details</h3>
                <ul className="detail-list">
                  <li>
                    <strong>Bed Type:</strong> {room.defaultBedType || "Standard"}
                  </li>
                  <li>
                    <strong>Max Occupancy:</strong> {room.maxOccupancy} Guests
                  </li>
                  <li>
                    <strong>Adults:</strong> Up to {room.maxAdults}
                  </li>
                  <li>
                    <strong>Children:</strong> Up to {room.maxChildren}
                  </li>
                </ul>
                <div className="action-area">
                  <a href={`/book?roomTypeId=${room.id}`} className="btn btn-primary btn-block">
                    Book This Room
                  </a>
                </div>
              </div>
            </div>
            
            <div className="room-gallery">
              <h3>Gallery</h3>
              {galleryImages.length > 0 ? (
                <GalleryClient images={galleryImages} />
              ) : (
                <p>No images available for this room.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .back-link {
          display: inline-block;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-weight: 500;
        }
        .back-link:hover {
          color: #fff;
          text-decoration: underline;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          max-width: 600px;
        }
        .room-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
        }
        @media (min-width: 900px) {
          .room-detail-grid {
            grid-template-columns: 350px 1fr;
            align-items: start;
          }
        }
        .info-card {
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          border: 1px solid #e5e5e5;
          position: sticky;
          top: 2rem;
        }
        .detail-list {
          list-style: none;
          padding: 0;
          margin: 1.5rem 0;
        }
        .detail-list li {
          padding: 0.75rem 0;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
        }
        .detail-list li:last-child {
          border-bottom: none;
        }
        .action-area {
          margin-top: 1.5rem;
        }
        .btn-block {
          background-color: #000;
          color: white;
          display: block;
          width: 100%;
          text-align: center;
          padding: 1rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .btn-block:hover {
          background-color: #333;
        }
      `}</style>
    </main>
  );
}
