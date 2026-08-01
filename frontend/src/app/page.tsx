import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustedCompanies } from "@/components/landing/trusted-companies";
import { FeaturedJobs } from "@/components/landing/featured-jobs";
import { TopCategories } from "@/components/landing/top-categories";
import { SuccessStories } from "@/components/landing/success-stories";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { BlogPreview } from "@/components/landing/blog-preview";
import { NewsletterSection } from "@/components/landing/newsletter-section";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <TrustedCompanies />
        <FeaturedJobs />
        <TopCategories />
        <SuccessStories />
        <PricingSection />
        <FaqSection />
        <BlogPreview />
        <NewsletterSection />
      </main>
      <SiteFooter />
    </>
  );
}
