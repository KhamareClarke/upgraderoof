import type { Metadata } from 'next';
import { AreaPageTemplate } from '@/components/AreaPageTemplate';
import { townData } from '@/lib/town-data';

export const dynamic = 'force-static';
export const revalidate = false;

const data = townData['newcastle-under-lyme'];

export default function Page() {
  return <AreaPageTemplate {...data} />;
}