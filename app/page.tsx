import { lucia, validateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const { user } = await validateRequest()
  if (!user) {
    console.log("[app/page.tsx] redirect /login")
    return redirect("/login")
  }

  return (
    <div>
      <h1>HELLO, {JSON.stringify(user)}</h1>
      <form action={logout}>
        <button>logout</button>
      </form>
    </div>
  );
}

async function logout() {
  "use server"
  const { session } = await validateRequest()
  if (!session) {
    return
  }
  await lucia.invalidateSession(session.id)

  const sessionCookie = lucia.createBlankSessionCookie()
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  return redirect("/login")
}
