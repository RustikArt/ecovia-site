function projectRefFromUrl(url?: string) {
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    return host.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

function keyPreview(key?: string) {
  if (!key) return null;
  if (key.length <= 10) return key;
  return `${key.slice(0, 10)}...(${key.length})`;
}

export async function GET() {
  const processUrl = process.env.SUPABASE_URL;
  const processAnon = process.env.SUPABASE_PUBLISHABLE_KEY;
  const processService = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const viteUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? undefined;
  const viteAnon = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? undefined;

  return new Response(
    JSON.stringify(
      {
        server: {
          SUPABASE_URL: processUrl ?? null,
          SUPABASE_PROJECT_REF: projectRefFromUrl(processUrl ?? undefined),
          SUPABASE_PUBLISHABLE_KEY: keyPreview(processAnon ?? undefined),
          SUPABASE_SERVICE_ROLE_KEY: keyPreview(processService ?? undefined),
        },
        build: {
          VITE_SUPABASE_URL: viteUrl ?? null,
          VITE_SUPABASE_PROJECT_REF: projectRefFromUrl(viteUrl),
          VITE_SUPABASE_PUBLISHABLE_KEY: keyPreview(viteAnon),
        },
      },
      null,
      2,
    ),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
