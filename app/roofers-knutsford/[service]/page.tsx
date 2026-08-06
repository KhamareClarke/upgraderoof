import { ServiceLocationTemplate } from '@/components/ServiceLocationTemplate';
import { generateServiceLocationStaticParams, generateServiceLocationMetadata } from '@/lib/service-location-helpers';
import { townData } from '@/lib/town-data';
import { getService } from '@/lib/service-data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return generateServiceLocationStaticParams();
}

export async function generateMetadata({ params }: { params: { service: string } }): Promise<Metadata> {
  return generateServiceLocationMetadata('knutsford', params.service);
}

export const dynamic = 'force-static';
export const revalidate = false;

export default function Page({ params }: { params: { service: string } }) {
  const service = getService(params.service);
  if (!service) notFound();
  return <ServiceLocationTemplate service={service} town={townData['knutsford']} />;
}