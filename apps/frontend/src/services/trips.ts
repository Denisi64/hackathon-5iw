import { api } from './api'
import type { Itinerary } from '../utils/idfmNetwork'

export type TripLineType = 'metro' | 'rer' | 'bus' | 'tram' | 'transilien'

export interface TripItem {
  id: string
  line: string
  toLine: string | null
  lineType: TripLineType
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  duration: number
  zones: number[]
  itineraryData: Itinerary | null
  co2Saved: number
  tripDate: string
}

export interface LogTripDto {
  line: string
  toLine?: string
  lineType: TripLineType
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  duration: number
  zones: number[]
  itineraryData?: Itinerary
  co2Saved: number
}

export interface WeekStats {
  weekTrips: number
  weekDuration: number
  weekCo2Saved: number
  weekKm: number
  mostUsedLine: string | null
  streak: number
}

export const tripsService = {
  getWeek: () => api.get<WeekStats>('/trips/week').then((r) => r.data),
  getHistory: () => api.get<TripItem[]>('/trips/history').then((r) => r.data),
  log: (trip: LogTripDto) => api.post<TripItem>('/trips/log', trip).then((r) => r.data),
}
