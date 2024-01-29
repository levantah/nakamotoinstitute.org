import { Metadata } from "next";

import { PageHeader } from "@/app/components/PageHeader";
import { PageLayout } from "@/app/components/PageLayout";
import { getMempoolSeries, getMempoolSeriesParams } from "@/lib/api/mempool";
import { i18nTranslation } from "@/lib/i18n/i18nTranslation";
import { urls } from "@/lib/urls";

import { PostListing } from "@main/mempool/components/PostListing";

export const dynamicParams = false;

export async function generateMetadata({
  params: { locale, slug },
}: LocaleParams<{ slug: string }>): Promise<Metadata> {
  const { series } = await getMempoolSeries(slug, locale);
  return {
    title: series.title,
  };
}

export default async function SeriesDetail({
  params: { slug, locale },
}: LocaleParams<{ slug: string }>) {
  const { t } = await i18nTranslation(locale);
  const { series, posts } = await getMempoolSeries(slug, locale);

  const generateHref = (l: Locale) => {
    const translation = series.translations?.find((t) => t.locale === l);
    if (translation) {
      return urls(l).mempool.seriesDetail(translation.slug);
    }
    return urls(l).mempool.seriesIndex;
  };

  return (
    <PageLayout locale={locale} generateHref={generateHref}>
      <PageHeader title={series.title}></PageHeader>
      <section>
        {posts?.map((post) => (
          <PostListing key={post.slug} locale={locale} post={post} />
        ))}
      </section>
    </PageLayout>
  );
}

export async function generateStaticParams() {
  return getMempoolSeriesParams();
}
