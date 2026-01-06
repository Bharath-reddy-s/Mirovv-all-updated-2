// Reset session storage on window load/refresh to ensure popups show again
if (typeof window !== 'undefined') {
  // Clear the keys immediately on script execution (which happens on full load/refresh)
  sessionStorage.removeItem("homePopupShownThisLoad");
  sessionStorage.removeItem("shopPopupShownThisLoad");
}
