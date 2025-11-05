/*
  # Create blog posts table

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text) - Blog post title
      - `slug` (text, unique) - URL-friendly version of title
      - `excerpt` (text) - Short summary
      - `content` (text) - Full blog content in markdown
      - `author` (text) - Author name
      - `featured_image` (text) - Hero image URL
      - `category` (text) - Post category
      - `tags` (text[]) - Array of tags
      - `is_published` (boolean) - Publication status
      - `published_at` (timestamptz) - Publication date
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `blog_posts` table
    - Add policy for public read access to published posts
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  author text NOT NULL DEFAULT 'Upgrade Roofing Team',
  featured_image text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT true,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts
  FOR SELECT
  USING (is_published = true);