import "server-only";
import { revalidatePath } from "next/cache";

/** Marks every pre-rendered public page as stale; each is re-rendered on its next visit. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}
