import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Create placeholder client if env vars are missing to prevent runtime errors
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables not set. Using placeholder client for development.');
    supabaseClient = createClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder'
    ) as SupabaseClient;
    return supabaseClient;
  }

  supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!);
  return supabaseClient;
}

// Lazy initialization - only creates client when first accessed
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export type Service = {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  is_featured: boolean;
  created_at: string;
};

export type QuoteRequest = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  postcode: string;
  service_type: string;
  message?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type ContactMessage = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read?: boolean;
  created_at?: string;
};

export type GalleryImage = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  display_order: number;
  is_featured: boolean;
  created_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  featured_image: string;
  category: string;
  tags: string[];
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
};
