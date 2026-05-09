import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Dashboard (owner-facing) and admin panel require sign-in.
// Marketing page (/), sign-in/sign-up, and the public waitlist endpoint
// (/api/waitlist) are public.
//
// API routes are NOT protected here — each route handler does its own
// auth check and returns proper 401/403 JSON (Clerk's auth.protect() on
// API routes returns 404 for unauthenticated requests, which is confusing).
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
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
