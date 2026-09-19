/** Baseline CSP + frame/camera headers for every response. */
export function securityHeaders(): Record<string, string> {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "connect-src 'self' https://buy.stripe.com https://checkout.stripe.com",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://buy.stripe.com https://checkout.stripe.com",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  return {
    "Content-Security-Policy": csp,
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), interest-cohort=()",
    "X-DNS-Prefetch-Control": "off",
  };
}
