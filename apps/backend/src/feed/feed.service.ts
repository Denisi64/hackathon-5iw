import { Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { feedItems, users } from '../db/schema'

@Injectable()
export class FeedService {
  async getFeed(userId: string) {
    const [user, items] = await Promise.all([
      db.select({ interests: users.interests, profile: users.profile }).from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(feedItems).where(eq(feedItems.active, true)),
    ])

    const currentUser = user[0]
    if (!currentUser) return items.slice(0, 5)

    const userInterests = (currentUser.interests ?? []) as string[]
    const userProfile = currentUser.profile ?? 'employee'

    return items
      .map((item) => {
        let score = 0
        if ((item.relevantProfiles as string[]).includes(userProfile)) score += 3
        const matchingInterests = (item.relevantInterests as string[]).filter((i) => userInterests.includes(i))
        score += matchingInterests.length * 2
        return { item, score }
      })
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
  }
}
