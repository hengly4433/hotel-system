export type RoomImage = {
  id?: string;
  url: string;
  sortOrder: number;
};

export type Room = {
    id: string;
    roomNumber: string;
    roomTypeId: string;
    roomTypeName?: string;
    propertyId: string;
    propertyName?: string;
    floorNumber?: number | null;
    description?: string | null;
    isActive: boolean;
    profileImage?: string;
    galleryImages?: RoomImage[];
  };
