# Gallery Images Migration

This migration inserts 9 gallery images into the `gallery_images` table with proper categorization.

## Image Categories

- **Tile Roofs**: 2 images (1.jpeg, 2.jpeg)
- **Flat Roofs**: 2 images (3.jpeg, 4.jpeg)
- **Chimneys**: 1 image (5.jpeg)
- **Gutters**: 1 image (6.jpeg)
- **Skylights**: 1 image (7.jpeg)
- **Cladding**: 2 images (8.jpeg, 9.jpeg)

## How to Run

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/migrations/20250102000000_insert_gallery_images.sql`
4. Copy and paste the SQL into the editor
5. Click **Run** to execute

Alternatively, if you're using Supabase CLI:
```bash
supabase db reset
# or
supabase migration up
```

## Image Storage

The images are stored in the `public/images/` folder and will be served at:
- `/images/1.jpeg`
- `/images/2.jpeg`
- etc.

These paths work both locally and when deployed to Vercel.

## Notes

- Images are already copied to `public/images/` folder
- The migration uses `ON CONFLICT DO NOTHING` so you can run it multiple times safely
- Featured images are marked with `is_featured: true`
- Display order is set to show images in the correct sequence

