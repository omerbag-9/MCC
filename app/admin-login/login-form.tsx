"use client";

import { useActionState } from "react";
import { adminLogin } from "@/lib/actions/login";

export function LoginForm() {
  const [state, action, pending] = useActionState(adminLogin, {});
  return (
    <form action={action} className="mt-8 space-y-4 text-left">
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus className="field" />
      </div>
      {state.error && <p className="text-sm text-red-700" role="alert">{state.error}</p>}
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
