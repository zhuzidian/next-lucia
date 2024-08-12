import { cache } from "react";
import { cookies } from "next/headers";

import { Lucia, Session, User } from "lucia"
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

import { db } from "@/lib/db"
import { userTable, sessionTable } from "@/db/schema"

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // expires: false,
    attributes: {
      secure: false, // process.env.NODE_ENV === "production"
      sameSite: "strict",
    }
  },
  getUserAttributes: (databaseUserAttributes) => {
    return {
      username: databaseUserAttributes.username,
      role: databaseUserAttributes.role,
    }
  }
})

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
  role: string;
}

export const validateRequest = cache(
  async (): Promise<{ user: User, session: Session } | { user: null, session: null }> => {
    console.log("lucia.sessionCookieName", lucia.sessionCookieName)
    
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
    if (!sessionId) {
      return {
        user: null,
        session: null,
      }
    }

    const result = await lucia.validateSession(sessionId)
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id)
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      }
    } catch (error) {
      console.log('validateRequest', error)
    }
    return result
  }
)
