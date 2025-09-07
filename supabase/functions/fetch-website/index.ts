import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Fetching website:', url);

    // Fetch the website content with timeout and better error handling
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      signal: controller.signal,
      redirect: 'follow'
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    
    // Handle different content types
    if (contentType.includes('text/html')) {
      const html = await response.text();
      
      // Extract key information from HTML
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : url;
      
      // Extract meta description
      const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
      const description = descMatch ? descMatch[1] : '';
      
      // Extract text content (simplified)
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      let textContent = '';
      if (bodyMatch) {
        // Remove script and style tags
        textContent = bodyMatch[1]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 5000); // Limit text length
      }
      
      // Extract links
      const linkMatches = html.matchAll(/<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["']/gi);
      const links = Array.from(linkMatches).map(match => {
        const href = match[1];
        // Convert relative URLs to absolute
        try {
          return new URL(href, url).href;
        } catch {
          return href;
        }
      }).filter(link => link.startsWith('http'));
      
      // Extract images
      const imgMatches = html.matchAll(/<img\s+(?:[^>]*?\s+)?src=["']([^"']+)["']/gi);
      const images = Array.from(imgMatches).map(match => {
        const src = match[1];
        try {
          return new URL(src, url).href;
        } catch {
          return src;
        }
      }).filter(img => img.startsWith('http')).slice(0, 10);
      
      return new Response(
        JSON.stringify({
          success: true,
          url,
          title,
          description,
          content: textContent,
          links: links.slice(0, 50), // Limit number of links
          images,
          contentType,
          rawHtml: html.substring(0, 50000) // Send limited HTML for rendering
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      // For non-HTML content, return basic info
      return new Response(
        JSON.stringify({
          success: true,
          url,
          contentType,
          message: `Content type ${contentType} cannot be rendered as HTML`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error fetching website:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});