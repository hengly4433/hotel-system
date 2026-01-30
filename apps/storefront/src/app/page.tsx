import HomeClient from "@/app/components/HomeClient";
import { publicApi } from "@/lib/publicApi";

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

type RoomType = {
  id: string;
  propertyId: string;
  code: string;
  name: string;
  baseDescription: string | null;
  defaultBedType: string | null;
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
};

export const dynamic = "force-dynamic";

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

export default async function HomePage() {
  let properties: PropertyOption[] = [];
  let roomTypes: RoomType[] = [];
  let galleryImages: string[] = [];
  let hasPropertyError = false;

  try {
    properties = await publicApi<PropertyOption[]>("/public/properties");
    if (properties.length > 0) {
      roomTypes = await publicApi<RoomType[]>(`/public/room-types?propertyId=${properties[0].id}`);
      galleryImages = collectGalleryImages(roomTypes);
    }
  } catch (err) {
    hasPropertyError = true;
  }

  return (
    <HomeClient
      properties={properties}
      roomTypes={roomTypes}
      galleryImages={galleryImages}
      hasPropertyError={hasPropertyError}
    />
  );
}
