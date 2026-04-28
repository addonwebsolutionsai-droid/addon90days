import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only protect /dashboard and everything under it.
// All marketplace pages (/, /skills, /skills/[id]) are public.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/skills/run(.*)",
  "/api/checkout(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  // Run on all routes except Next.js internals and static assets.
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
