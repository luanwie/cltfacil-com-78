// Navigate to PRO subscription page with proper redirects and UTM preservation
export function navigateToProPage(navigate: (path: string) => void, isLogged: boolean, currentPath: string) {
  if (!isLogged) {
    navigate(`/login?next=${encodeURIComponent("/assinar-pro")}`);
    return;
  }

  // Preserve UTM parameters and current search params when navigating to /assinar-pro
  const currentUrl = new URL(window.location.href);
  const searchParams = currentUrl.search;
  navigate(`/assinar-pro${searchParams}`);
}