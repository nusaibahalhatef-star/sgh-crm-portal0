/**
 * Tests for Detail Pages UI Improvements
 * DoctorDetailPage, OfferDetailPage, CampDetailPage
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function readPage(name: string): string {
  return readFileSync(resolve(__dirname, '..', `${name}.tsx`), 'utf-8');
}

describe('DoctorDetailPage Improvements', () => {
  const src = readPage('DoctorDetailPage');

  it('should have skeleton loading state', () => {
    expect(src).toContain('Skeleton');
    expect(src).toContain('isLoading');
  });

  it('should have breadcrumb navigation', () => {
    expect(src).toContain('الرئيسية');
    expect(src).toContain('الأطباء');
  });

  it('should have not-found state with proper UI', () => {
    expect(src).toContain('لم يتم العثور على الطبيب');
  });

  it('should have hero section with gradient', () => {
    expect(src).toContain('bg-gradient-to');
  });

  it('should have booking form with required fields', () => {
    expect(src).toContain('fullName');
    expect(src).toContain('phone');
    expect(src).toContain('handleSubmit');
  });

  it('should have SEO component', () => {
    expect(src).toContain('<SEO');
  });

  it('should have trust elements', () => {
    expect(src).toContain('حجز آمن');
  });

  it('should have contact section with phone and WhatsApp', () => {
    expect(src).toContain('8000018');
    expect(src).toContain('wa.me');
  });

  it('should use RTL direction', () => {
    expect(src).toContain('dir="rtl"');
  });

  it('should have responsive grid layout', () => {
    expect(src).toContain('md:grid-cols');
  });
});

describe('OfferDetailPage Improvements', () => {
  const src = readPage('OfferDetailPage');

  it('should have skeleton loading state', () => {
    expect(src).toContain('Skeleton');
    expect(src).toContain('isLoading');
  });

  it('should have breadcrumb navigation', () => {
    expect(src).toContain('الرئيسية');
    expect(src).toContain('العروض');
  });

  it('should have not-found state with proper UI', () => {
    expect(src).toContain('لم يتم العثور على العرض');
  });

  it('should have hero section with offer badge', () => {
    expect(src).toContain('عرض خاص محدود');
    expect(src).toContain('Sparkles');
  });

  it('should calculate days remaining', () => {
    expect(src).toContain('daysRemaining');
  });

  it('should have "What\'s Included" section', () => {
    expect(src).toContain('ماذا يشمل العرض');
  });

  it('should have registration form with required fields', () => {
    expect(src).toContain('fullName');
    expect(src).toContain('phone');
    expect(src).toContain('handleSubmit');
  });

  it('should have expired offer notice', () => {
    expect(src).toContain('العرض منتهي');
  });

  it('should have contact section with phone and WhatsApp', () => {
    expect(src).toContain('8000018');
    expect(src).toContain('wa.me');
  });

  it('should use RTL direction', () => {
    expect(src).toContain('dir="rtl"');
  });
});

describe('CampDetailPage Improvements', () => {
  const src = readPage('CampDetailPage');

  it('should have skeleton loading state', () => {
    expect(src).toContain('Skeleton');
    expect(src).toContain('isLoading');
  });

  it('should have breadcrumb navigation', () => {
    expect(src).toContain('الرئيسية');
    expect(src).toContain('المخيمات');
  });

  it('should have not-found state with proper UI', () => {
    expect(src).toContain('لم يتم العثور على المخيم');
  });

  it('should have hero section with camp badge', () => {
    expect(src).toContain('مخيم طبي خيري');
  });

  it('should have free offers section', () => {
    expect(src).toContain('خدمات مجانية');
    expect(src).toContain('freeOffers');
  });

  it('should have discounted offers section', () => {
    expect(src).toContain('عروض مخفضة');
    expect(src).toContain('discountedOffers');
  });

  it('should have gallery section', () => {
    expect(src).toContain('معرض صور المخيم');
    expect(src).toContain('galleryImages');
  });

  it('should have registration form with age and procedures', () => {
    expect(src).toContain('fullName');
    expect(src).toContain('phone');
    expect(src).toContain('age');
    expect(src).toContain('procedures');
  });

  it('should have show more/less toggle for offers', () => {
    expect(src).toContain('showAllFreeOffers');
    expect(src).toContain('showAllDiscountedOffers');
    expect(src).toContain('عرض المزيد');
  });

  it('should have expired camp notice', () => {
    expect(src).toContain('المخيم منتهي');
  });

  it('should have contact section with phone and WhatsApp', () => {
    expect(src).toContain('8000018');
    expect(src).toContain('wa.me');
  });

  it('should use RTL direction', () => {
    expect(src).toContain('dir="rtl"');
  });
});

describe('Consistent Design Patterns Across Detail Pages', () => {
  const doctor = readPage('DoctorDetailPage');
  const offer = readPage('OfferDetailPage');
  const camp = readPage('CampDetailPage');

  it('all pages should have Navbar and Footer', () => {
    [doctor, offer, camp].forEach(src => {
      expect(src).toContain('<Navbar');
      expect(src).toContain('<Footer');
    });
  });

  it('all pages should have SEO component', () => {
    [doctor, offer, camp].forEach(src => {
      expect(src).toContain('<SEO');
    });
  });

  it('all pages should have breadcrumb navigation', () => {
    [doctor, offer, camp].forEach(src => {
      expect(src).toContain('الرئيسية');
    });
  });

  it('all pages should have skeleton loading state', () => {
    [doctor, offer, camp].forEach(src => {
      expect(src).toContain('Skeleton');
    });
  });

  it('all pages should have not-found state', () => {
    expect(doctor).toContain('لم يتم العثور على الطبيب');
    expect(offer).toContain('لم يتم العثور على العرض');
    expect(camp).toContain('لم يتم العثور على المخيم');
  });

  it('all pages should have contact section', () => {
    [doctor, offer, camp].forEach(src => {
      expect(src).toContain('8000018');
    });
  });

  it('all pages should use RTL direction', () => {
    [doctor, offer, camp].forEach(src => {
      expect(src).toContain('dir="rtl"');
    });
  });

  it('all pages should have gradient hero sections', () => {
    [doctor, offer, camp].forEach(src => {
      expect(src).toContain('bg-gradient-to');
    });
  });
});
