import { apiJson } from "./client";

export interface DateRangeParams {
  fromDate: string;
  toDate: string;
}

export interface RevenueReportItem {
  date: string;
  paymentMethod: string;
  totalAmount: number;
  transactionCount: number;
}

export interface OccupancyReportItem {
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyPercentage: number;
}

export interface GuestInHouseItem {
  reservationId: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
}

export interface HousekeepingStatusItem {
  roomId: string;
  roomNumber: string;
  roomType: string;
  housekeepingStatus: string;
  assignedTo: string;
}

export const reportsApi = {
  getRevenue: (params: DateRangeParams) =>
    apiJson<RevenueReportItem[]>(`/reports/revenue?fromDate=${params.fromDate}&toDate=${params.toDate}`),

  getOccupancy: (params: DateRangeParams) =>
    apiJson<OccupancyReportItem[]>(`/reports/occupancy?fromDate=${params.fromDate}&toDate=${params.toDate}`),

  getGuestsInHouse: (date?: string) =>
    apiJson<GuestInHouseItem[]>(`/reports/guests-in-house${date ? `?date=${date}` : ""}`),

  getArrivals: (date?: string) =>
    apiJson<GuestInHouseItem[]>(`/reports/arrivals${date ? `?date=${date}` : ""}`),

  getDepartures: (date?: string) =>
    apiJson<GuestInHouseItem[]>(`/reports/departures${date ? `?date=${date}` : ""}`),

  getHousekeeping: () =>
    apiJson<HousekeepingStatusItem[]>("/reports/housekeeping"),
  getNewBookingsCount: (date?: string) => {
    return apiJson<number>(`reports/new-bookings${date ? `?date=${date}` : ""}`);
  },
};
