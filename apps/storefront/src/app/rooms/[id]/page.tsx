import { publicApi } from "@/lib/publicApi";
import GalleryClient from "../../gallery/GalleryClient";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

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
          <Link href="/rooms" className={styles.backLink}>
            ← Back to Rooms
          </Link>
          <h1>{room.name}</h1>
          <p className={styles.heroSubtitle}>{room.baseDescription}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.roomDetailGrid}>
            <div className="room-info">
              <div className={styles.infoCard}>
                <h3>Details</h3>
                <ul className={styles.detailList}>
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
                <div className={styles.actionArea}>
                  <a href={`/book?roomTypeId=${room.id}`} className={`btn btn-primary ${styles.btnBlock}`}>
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
    </main>
  );
}
