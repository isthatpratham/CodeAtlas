export function validateGitHubUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    return (
      (parsed.hostname === "github.com" || parsed.hostname === "www.github.com") &&
      pathParts.length >= 2
    );
  } catch {
    return false;
  }
}

export function parseGitHubUrl(url: string): { owner: string; name: string } | null {
  if (!validateGitHubUrl(url)) {
    return null;
  }
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    return {
      owner: pathParts[0],
      name: pathParts[1].replace(/\.git$/, ""),
    };
  } catch {
    return null;
  }
}
