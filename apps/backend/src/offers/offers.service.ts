import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { offers } from '../db/schema'

const PROFILE_OFFER_IDS: Record<string, string[]> = {
  salarie: ['navigo_annuel', 'navigo_mois', 'navigo_semaine', 'liberte_plus'],
  etudiant: ['imagine_r_etudiant'],
  scolaire_junior: ['imagine_r_junior'],
  scolaire: ['imagine_r_scolaire'],
  senior: ['navigo_senior', 'navigo_annuel', 'navigo_mois'],
  tst: ['tst_50', 'tst_75', 'tst_gratuite'],
  amethyste: ['amethyste'],
}

@Injectable()
export class OffersService {
  async findAll(profile?: string) {
    const all = await db.select().from(offers).where(eq(offers.actif, true))
    if (!profile) return all
    const allowed = PROFILE_OFFER_IDS[profile]
    if (!allowed) return all
    return all.filter((o) => allowed.includes(o.id))
  }

  async findById(id: string) {
    const [offer] = await db.select().from(offers).where(eq(offers.id, id)).limit(1)
    if (!offer) throw new NotFoundException('Offre introuvable')
    return offer
  }
}
