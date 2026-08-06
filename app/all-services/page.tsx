import { permanentRedirect } from 'next/navigation';

export default function AllServicesRedirect() {
  permanentRedirect('/services');
}
