import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public marketplace: /, /skills, /skills/[slug], /legal/* are open.
// Everything below requires sign-in:
//   - /account/*           — user profile, my skills, billing
//   - /dashboard(.*)       — legacy redirect
//   - /api/skills/.../install — beta install (capture user before download)
//   - /api/skills/run(.*)  — paid skill execution
//   - /api/checkout(.*)    — payment
// Note: /api/skills/[slug]/install handles its own auth + redirect inline,
// because we want a 302 redirect (not 401 JSON) when a browser hits it logged-out.
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/dashboard(.*)",
  "/api/skills/run(.*)",
  "/api/checkout(.*)",
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
