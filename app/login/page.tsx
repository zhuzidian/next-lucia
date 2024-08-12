import { userTable } from "@/db/schema"
import { lucia } from "@/lib/auth"
import { db } from "@/lib/db"
import { Form } from "@/lib/form"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  return (
    <div>
      <h1>Sign in</h1>
      <Form action={login}>
        <label htmlFor="username">Username</label>
        <input name="username" id="username" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <button>LOGIN</button>
      </Form>
    </div>
  )
}

async function login(_: any, formData: FormData): Promise<ActionResult> {
  "use server"
  const username = formData.get("username")
  const password = formData.get("password")
  console.log("[login.tsx] username=", username)
  console.log("[login.tsx] password=", password)

  if (typeof username !== "string") {
    return {
      error: "invalid username"
    }
  }
  if (typeof password !== "string") {
    return {
      error: "invalid password"
    }
  }

  const result = await db.select().from(userTable).where(eq(userTable.username, username))
  if (result.length === 0) {
    return {
      error: "Incorrect username or password"
    }
  }
  const user = result[0]
  if (user.password !== password) {
    return {
      error: "Incorrect username or password"
    }
  }

  const session = await lucia.createSession(user.id, {})
  const sessionCookie = lucia.createSessionCookie(session.id)
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  return redirect("/")
}

interface ActionResult {
  error: string;
}
