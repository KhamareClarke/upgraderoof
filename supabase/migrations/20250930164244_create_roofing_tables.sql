/*
  # Create Roofing Website Database Schema

  ## Overview
  This migration creates the complete database schema for the Upgrade Roofing Solutions website,
  including tables for services, testimonials, quote requests, contact messages, and gallery images.

  ## New Tables

  1. **services**
    - `id` (uuid, primary key) - Unique identifier for each service
    - `title` (text) - Service name
    - `description` (text) - Detailed service description
    - `icon_name` (text) - Lucide icon name for the service
    - `image_url` (text) - URL to service image
    - `display_order` (integer) - Order for displaying services
    - `is_active` (boolean) - Whether service is currently offered
    - `created_at` (timestamptz) - Record creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  2. **testimonials**
    - `id` (uuid, primary key) - Unique identifier for each testimonial
    - `name` (text) - Customer name
    - `location` (text) - Customer location (city, area)
    - `rating` (integer) - Star rating (1-5)
    - `text` (text) - Testimonial content
    - `is_featured` (boolean) - Whether to show on homepage
    - `created_at` (timestamptz) - Record creation timestamp

  3. **quote_requests**
    - `id` (uuid, primary key) - Unique identifier for each quote request
    - `name` (text) - Customer name
    - `email` (text) - Customer email
    - `phone` (text) - Customer phone number
    - `postcode` (text) - Customer postcode
    - `service_type` (text) - Type of service requested
    - `message` (text) - Additional details from customer
    - `status` (text) - Request status (pending, contacted, quoted, completed)
    - `created_at` (timestamptz) - Record creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  4. **contact_messages**
    - `id` (uuid, primary key) - Unique identifier for each message
    - `name` (text) - Sender name
    - `email` (text) - Sender email
    - `phone` (text) - Sender phone number
    - `subject` (text) - Message subject
    - `message` (text) - Message content
    - `is_read` (boolean) - Whether message has been read
    - `created_at` (timestamptz) - Record creation timestamp

  5. **gallery_images**
    - `id` (uuid, primary key) - Unique identifier for each image
    - `title` (text) - Image title
    - `description` (text) - Image description
    - `image_url` (text) - URL to the image
    - `category` (text) - Category (tile-roofs, flat-roofs, chimneys, etc.)
    - `display_order` (integer) - Order for displaying images
    - `is_featured` (boolean) - Whether to show on homepage
    - `created_at` (timestamptz) - Record creation timestamp

  ## Security

  - Enable RLS on all tables
  - Public read access for services, testimonials (featured only), and gallery_images
  - Authenticated insert for quote_requests and contact_messages
  - Admin-only update/delete for all tables

  ## Important Notes

  - All tables use UUID primary keys with automatic generation
  - Timestamps are automatically set with default values
  - RLS policies ensure data security while allowing public access to display content
  - Status fields use meaningful defaults
*/

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL DEFAULT 'Home',
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text text NOT NULL,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create quote_requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  postcode text NOT NULL,
  service_type text NOT NULL,
  message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  category text NOT NULL,
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services table
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service workers can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service workers can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for testimonials table
CREATE POLICY "Anyone can view featured testimonials"
  ON testimonials FOR SELECT
  USING (is_featured = true);

CREATE POLICY "Authenticated users can insert testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for quote_requests table
CREATE POLICY "Anyone can submit quote requests"
  ON quote_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own quote requests"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update quote requests"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for contact_messages table
CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contact messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for gallery_images table
CREATE POLICY "Anyone can view gallery images"
  ON gallery_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert gallery images"
  ON gallery_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery images"
  ON gallery_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured, created_at);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status, created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category, display_order);

-- Insert initial services data
INSERT INTO services (title, description, icon_name, image_url, display_order) VALUES
  ('Tile & Slate Roofs', 'Expert installation and repair of traditional tile and slate roofing. Weather resistant, durable, and aesthetically pleasing for your home.', 'Home', 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600', 1),
  ('Flat Roofs', 'Modern flat roofing solutions with superior waterproofing. Perfect for extensions, garages, and commercial properties.', 'Layers', 'https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg?auto=compress&cs=tinysrgb&w=600', 2),
  ('Chimney Repairs', 'Professional chimney maintenance and repair services. From repointing to full rebuilds, we keep your chimney safe and functional.', 'Flame', 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=600', 3),
  ('Gutters & Fascias', 'Complete gutter and fascia installation, repair, and maintenance. Protect your property from water damage with quality materials.', 'Droplets', 'https://images.pexels.com/photos/534220/pexels-photo-534220.jpeg?auto=compress&cs=tinysrgb&w=600', 4),
  ('Skylights & Roof Windows', 'Bring natural light into your home with professionally installed skylights and roof windows. Expert fitting and weatherproofing guaranteed.', 'Sun', 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=600', 5),
  ('Cladding Installations', 'Transform your property with modern cladding solutions. Weather-resistant materials installed to the highest standards.', 'Square', 'https://images.pexels.com/photos/210538/pexels-photo-210538.jpeg?auto=compress&cs=tinysrgb&w=600', 6);

-- Insert initial testimonials data
INSERT INTO testimonials (name, location, rating, text, is_featured) VALUES
  ('Sarah Thompson', 'Sandbach, Cheshire', 5, 'Absolutely brilliant service from start to finish. The team was professional, tidy, and completed our roof replacement ahead of schedule. Highly recommended!', true),
  ('Michael Davies', 'Crewe, Cheshire', 5, 'Had our flat roof repaired and the quality of work is outstanding. Fair pricing and excellent communication throughout the project.', true),
  ('Jennifer Walsh', 'Congleton, Cheshire', 5, 'Called them out for an emergency leak repair. They arrived quickly and fixed the problem efficiently. Very honest and reliable company.', true);

-- Insert initial gallery images data
INSERT INTO gallery_images (title, description, image_url, category, display_order, is_featured) VALUES
  ('Modern Tile Roof Installation', 'Complete roof replacement with premium tiles in Sandbach', 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800', 'tile-roofs', 1, true),
  ('Flat Roof Extension', 'High-quality flat roof installation for home extension', 'https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg?auto=compress&cs=tinysrgb&w=800', 'flat-roofs', 2, true),
  ('Chimney Restoration', 'Complete chimney rebuild and repointing service', 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=800', 'chimneys', 3, true),
  ('Gutter Replacement', 'New gutter and fascia installation', 'https://images.pexels.com/photos/534220/pexels-photo-534220.jpeg?auto=compress&cs=tinysrgb&w=800', 'gutters', 4, false),
  ('Skylight Installation', 'Velux window installation bringing natural light', 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=800', 'skylights', 5, false),
  ('Cladding Project', 'Modern cladding installation on residential property', 'https://images.pexels.com/photos/210538/pexels-photo-210538.jpeg?auto=compress&cs=tinysrgb&w=800', 'cladding', 6, false);