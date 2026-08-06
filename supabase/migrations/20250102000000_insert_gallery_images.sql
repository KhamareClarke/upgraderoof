-- Remove all existing gallery images and insert only the 10 new local images
-- Categories: tile-roofs, flat-roofs, chimneys, gutters, skylights, cladding

-- Delete all existing gallery images first
DELETE FROM gallery_images;

-- Insert the 10 new gallery images from local images folder
-- Categorized based on actual image content:
-- Tiled Roofs: 6.jpeg, 7.jpeg (2 images)
-- Flat Roofs: 3.jpeg, 9.jpeg (2 images)
-- Chimneys: 1.jpeg (1 image)
-- Gutters: 2.jpeg, 8.jpeg (2 images)
-- Cladding: 4.jpeg, 5.jpeg (2 images)
-- Skylights: 10.jpeg (1 image)
INSERT INTO gallery_images (title, description, image_url, category, display_order, is_featured) VALUES
  -- Chimneys (1 image: 1.jpeg)
  ('Chimney Repair & Restoration', 'Complete chimney restoration work showing two brick chimneys', '/images/1.jpeg', 'chimneys', 1, true),
  
  -- Gutters (2 images: 2.jpeg, 8.jpeg)
  ('Gutter Installation Service', 'Professional gutter installation and maintenance work', '/images/2.jpeg', 'gutters', 1, false),
  ('Gutter Replacement Project', 'Gutter and fascia installation service in Cheshire', '/images/8.jpeg', 'gutters', 2, false),
  
  -- Flat Roofs (2 images: 3.jpeg, 9.jpeg)
  ('Flat Roof Installation', 'Modern flat roof system installation on residential property', '/images/3.jpeg', 'flat-roofs', 1, true),
  ('Flat Roof Project', 'Professional flat or low-pitched roof installation', '/images/9.jpeg', 'flat-roofs', 2, false),
  
  -- Cladding (2 images: 4.jpeg, 5.jpeg)
  ('Cladding Installation', 'External wall cladding installation and inspection', '/images/4.jpeg', 'cladding', 1, false),
  ('Residential Cladding Work', 'Complete cladding installation on residential property', '/images/5.jpeg', 'cladding', 2, false),
  
  -- Tiled Roofs (2 images: 6.jpeg, 7.jpeg)
  ('Tile Roof Installation', 'Professional tile roof installation and repair work', '/images/6.jpeg', 'tile-roofs', 1, true),
  ('Tile Roofing Work', 'Close-up view of tile roofing with visible ridgeline', '/images/7.jpeg', 'tile-roofs', 2, false),
  
  -- Skylights (1 image: 10.jpeg)
  ('Skylight Installation', 'Professional skylight installation bringing natural light into your home', '/images/10.jpeg', 'skylights', 1, true);

