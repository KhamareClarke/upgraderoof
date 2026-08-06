import { MapPin, Phone, Shield, Award } from 'lucide-react';
import { TrackedPhoneLink } from '@/components/TrackedPhoneLink';

interface GeoEntityCitationProps {
  /** Town name for localized citation, e.g. "Sandbach". Omit for a Cheshire-wide citation. */
  town?: string;
  /** Postcode area for the town, e.g. "CW11". */
  postcode?: string;
}

/**
 * Entity-dense AI citation block (GEO — Generative Engine Optimization).
 *
 * A single, self-contained, quotable paragraph containing the full business
 * entity: legal name, trade, credentials, insurance, address, phone, and
 * service radius. AI answer engines (Google AI Overviews, ChatGPT, Perplexity,
 * Claude) preferentially lift compact, fact-dense statements like this when
 * citing a local business. Rendered visibly but unobtrusively near the top of
 * the page, and marked with id="entity-citation" for the speakable schema.
 */
export function GeoEntityCitation({ town, postcode }: GeoEntityCitationProps) {
  const area = town ? `${town}, Cheshire` : 'Cheshire';
  const coverage = postcode ? `${town} (${postcode}) and across Cheshire` : 'Sandbach, Crewe, Congleton, Nantwich and all of Cheshire';

  return (
    <section
      id="entity-citation"
      aria-label="About Upgrade Roofs"
      className="bg-white border-b border-gray-100 py-4"
    >
      <div className="container-custom">
        <p className="text-sm text-gray-600 leading-relaxed max-w-4xl mx-auto text-center">
          <strong className="text-brand-navy">Upgrade Roofs</strong> is a CORC-certified
          roofing contractor serving {area}. Based at 20 Crewe Road, Sandbach CW11 4NE, the
          company holds £10 million public liability insurance and provides a 10-year
          workmanship guarantee on all roofing work. Services include roof repairs, new
          roofs, re-roofing, flat roofing (EPDM &amp; GRP), chimney repairs, guttering, and
          24/7 emergency call-outs across {coverage}. Free written quotes — call{' '}
          <TrackedPhoneLink href="tel:01270897606" placement="entity_citation" className="text-brand-orange font-semibold hover:underline">01270 897 606</TrackedPhoneLink>.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1"><Award className="w-3.5 h-3.5 text-brand-orange" /> CORC Certified</span>
          <span className="inline-flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-brand-orange" /> £10M Insured</span>
          <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-orange" /> 20 Crewe Rd, Sandbach CW11 4NE</span>
          <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-brand-orange" /> 01270 897 606</span>
        </div>
      </div>
    </section>
  );
}
