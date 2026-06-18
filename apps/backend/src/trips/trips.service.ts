import { Injectable } from '@nestjs/common'
import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm'
import { db } from '../db'
import { lineAlerts, trips, users } from '../db/schema'

const KM_PER_MIN: Record<string, number> = {
  metro: 0.8, rer: 1.2, transilien: 1.0, bus: 0.4, tram: 0.5,
}

interface UserStats {
  totalTrips: number
  totalCo2Saved: number
  totalKm: number
  streak: number
  linesUsed: string[]
  lineTypes: string[]
}

export const MONUMENT_BADGES: {
  id: string; emoji: string; label: string; story: string
  condition: (s: UserStats) => boolean
}[] = [
  { id: 'first_trip',   emoji: '🎫', label: 'Premier trajet',      story: 'Bienvenue dans l\'aventure Comutitres ! Votre premier trajet marque le début de votre histoire francilienne.',                                                               condition: (s) => s.totalTrips >= 1 },
  { id: 'tour_eiffel',  emoji: '🗼', label: 'Tour Eiffel',          story: 'Symbole de Paris depuis 1889, la Tour Eiffel accueille 7 millions de visiteurs par an. Le RER C vous y emmène directement.',                                               condition: (s) => s.linesUsed.some(l => ['C', 'RER C', '6', 'M6'].includes(l)) },
  { id: 'arc_triomphe', emoji: '🏛️', label: 'Arc de Triomphe',      story: 'Commandé par Napoléon en 1806, l\'Arc de Triomphe domine les Champs-Élysées. La ligne 1 vous y conduit directement.',                                                       condition: (s) => s.linesUsed.some(l => ['1', 'M1', '2', 'M2'].includes(l)) },
  { id: 'sacre_coeur',  emoji: '⛪', label: 'Sacré-Cœur',           story: 'Perché au sommet de Montmartre, le Sacré-Cœur offre la plus belle vue de Paris. La ligne 12 vous mène à Abbesses.',                                                          condition: (s) => s.linesUsed.some(l => ['12', 'M12'].includes(l)) },
  { id: 'notre_dame',   emoji: '🕌', label: 'Notre-Dame',            story: 'Chef-d\'œuvre gothique en renaissance depuis 2019. La ligne 4 vous dépose à Cité, à deux pas de la cathédrale.',                                                            condition: (s) => s.linesUsed.some(l => ['4', 'M4', 'B', 'RER B', 'D', 'RER D'].includes(l)) },
  { id: 'louvre',       emoji: '🖼️', label: 'Le Louvre',             story: 'Le plus grand musée du monde avec 35 000 œuvres. Palais Royal – Musée du Louvre sur la ligne 1 vous y accueille.',                                                           condition: (s) => s.linesUsed.some(l => ['1', 'M1', '7', 'M7'].includes(l)) && s.totalTrips >= 3 },
  { id: 'versailles',   emoji: '👑', label: 'Versailles',            story: 'Ancienne résidence des rois de France, 800 hectares de jardins. Le RER C vous emmène jusqu\'à Versailles Rive Gauche.',                                                     condition: (s) => s.linesUsed.some(l => ['C', 'RER C'].includes(l)) && s.totalKm >= 20 },
  { id: 'stade_france', emoji: '🏟️', label: 'Stade de France',      story: '80 000 places, scène de la finale 1998. Le RER B ou D vous y dépose en 20 min depuis Châtelet.',                                                                            condition: (s) => s.linesUsed.some(l => ['B', 'RER B', 'D', 'RER D'].includes(l)) },
  { id: 'eco_warrior',  emoji: '♻️', label: 'Éco-guerrier',          story: 'Vous avez économisé 50 kg de CO₂ grâce aux transports en commun. Chaque trajet compte pour la planète !',                                                                    condition: (s) => s.totalCo2Saved >= 50 },
  { id: 'streak_7',     emoji: '🔥', label: 'Voyageur régulier',     story: '7 jours consécutifs en transports — vous êtes un vrai habitué des réseaux franciliens !',                                                                                    condition: (s) => s.streak >= 7 },
  { id: 'multimodal',   emoji: '🚌', label: 'Multimodal',            story: 'Métro, RER et bus maîtrisés — vous exploitez tout le potentiel du réseau Île-de-France Mobilités !',                                                                         condition: (s) => new Set(s.lineTypes).size >= 3 },
  { id: 'explorer_50',  emoji: '🏅', label: 'Grand explorateur',     story: '50 trajets validés — Paris n\'a plus aucun secret pour vous. La Ville Lumière vous appartient !',                                                                            condition: (s) => s.totalTrips >= 50 },
]

@Injectable()
export class TripsService {
  async logTrip(userId: string, dto: {
    line: string; toLine?: string; lineType: 'metro' | 'rer' | 'bus' | 'tram' | 'transilien'
    from: string; to: string; departureTime: string; arrivalTime: string
    duration: number; zones: number[]; itineraryData?: unknown; co2Saved: number
  }) {
    const today = new Date().toISOString().split('T')[0]
    const [trip] = await db.insert(trips).values({ userId, ...dto, tripDate: today }).returning()
    await this.recomputeGamification(userId)
    return trip
  }

  private async recomputeGamification(userId: string) {
    const allTrips = await db.select().from(trips).where(eq(trips.userId, userId))
    const stats = this.computeStats(allTrips)
    const earnedBadges = MONUMENT_BADGES.filter((b) => b.condition(stats)).map((b) => b.id)
    const points = stats.totalTrips * 10 + Math.floor(stats.totalKm) * 2
    const level = Math.floor(points / 500) + 1
    await db.update(users).set({ points, level, badges: earnedBadges, updatedAt: new Date() }).where(eq(users.id, userId))
    return { points, level, badges: earnedBadges }
  }

  private computeStats(allTrips: { duration: number; lineType: string; co2Saved: number; tripDate: string; line: string }[]): UserStats {
    const totalTrips = allTrips.length
    const totalCo2Saved = allTrips.reduce((acc, t) => acc + t.co2Saved, 0) / 10
    const totalKm = allTrips.reduce((acc, t) => acc + t.duration * (KM_PER_MIN[t.lineType] ?? 0.8), 0)
    const linesUsed = [...new Set(allTrips.map((t) => t.line))]
    const lineTypes = [...new Set(allTrips.map((t) => t.lineType))]

    const dates = [...new Set(allTrips.map((t) => t.tripDate))].sort().reverse()
    let streak = 0
    const today = new Date()
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today)
      expected.setDate(today.getDate() - i)
      if (dates[i] === expected.toISOString().split('T')[0]) streak++
      else break
    }

    return { totalTrips, totalCo2Saved, totalKm, streak, linesUsed, lineTypes }
  }

  async getTodayTrips(userId: string) {
    const today = new Date().toISOString().split('T')[0]
    const currentTime = new Date().toTimeString().slice(0, 5)
    const todayTrips = await db.select().from(trips).where(
      and(eq(trips.userId, userId), eq(trips.tripDate, today), lte(trips.departureTime, currentTime))
    ).orderBy(trips.departureTime)

    return {
      date: today,
      totalTrips: todayTrips.length,
      totalDuration: todayTrips.reduce((acc, t) => acc + t.duration, 0),
      totalCo2Saved: Math.round(todayTrips.reduce((acc, t) => acc + t.co2Saved, 0)) / 10,
      trips: todayTrips,
    }
  }

  async getDetailedStats(userId: string) {
    const allTrips = await db.select().from(trips).where(eq(trips.userId, userId))
    const stats = this.computeStats(allTrips)
    const weekNumbers = new Set(allTrips.map((t) => {
      const d = new Date(t.tripDate)
      const start = new Date(d.getFullYear(), 0, 1)
      return Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
    }))
    return {
      totalTrips: stats.totalTrips,
      totalCo2Saved: Math.round(stats.totalCo2Saved * 10) / 10,
      totalKm: Math.round(stats.totalKm),
      weeksActive: weekNumbers.size,
    }
  }

  async getFavoriteLines(userId: string) {
    const allTrips = await db.select().from(trips).where(eq(trips.userId, userId))
    const lineCount: Record<string, { count: number; lineType: string }> = {}
    for (const trip of allTrips) {
      if (!lineCount[trip.line]) lineCount[trip.line] = { count: 0, lineType: trip.lineType }
      lineCount[trip.line].count++
    }
    return Object.entries(lineCount)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([line, data]) => ({ line, lineType: data.lineType, count: data.count }))
  }

  async getAlerts(userId: string) {
    const favorites = await this.getFavoriteLines(userId)
    if (favorites.length === 0) return []
    const favoriteLines = favorites.map((f) => f.line)
    const today = new Date().toISOString().split('T')[0]
    return db.select().from(lineAlerts).where(
      and(inArray(lineAlerts.line, favoriteLines), eq(lineAlerts.active, true), lte(lineAlerts.startDate, today))
    )
  }

  async getHistory(userId: string) {
    const allTrips = await db.select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.tripDate), desc(trips.departureTime))
    return allTrips
  }

  async getWeekStats(userId: string) {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 7)
    const weekTrips = await db.select().from(trips).where(
      and(eq(trips.userId, userId), gte(trips.tripDate, weekAgo.toISOString().split('T')[0]), lte(trips.tripDate, today.toISOString().split('T')[0]))
    )
    const stats = this.computeStats(weekTrips)
    const lineCount: Record<string, number> = {}
    for (const trip of weekTrips) lineCount[trip.line] = (lineCount[trip.line] ?? 0) + 1
    return {
      weekTrips: weekTrips.length,
      weekDuration: weekTrips.reduce((acc, t) => acc + t.duration, 0),
      weekCo2Saved: Math.round(stats.totalCo2Saved * 10) / 10,
      weekKm: Math.round(stats.totalKm),
      mostUsedLine: Object.entries(lineCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
      streak: stats.streak,
    }
  }
}
