import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public marketplace: /, /skills, /skills/[slug], /legal/* are open.
//
// Page routes that require sign-in are protected via middleware so the user
// gets a clean 302 redirect to /sign-in. API routes are NOT protected here —
// they each do their own auth check inline and return a proper 401 JSON
// response. Why: Clerk's `auth.protect()` returns a 404 (not 401) for
// unauthenticated API requests, which surfaces in the UI as "HTTP 404" — a
// confusing error for someone who's actually just been signed-out. Letting
// the route handler return JSON keeps the UX honest.
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  // Run on all routes except Next.js internals and static assets.
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
