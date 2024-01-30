import { Metadata } from "next";
import Link from "next/link";

import { locales } from "@/i18n";
import { getForumThreads } from "@/lib/api/posts";
import { ForumPostSource, ForumThread } from "@/lib/api/schemas/posts";
import { i18nTranslation } from "@/lib/i18n/i18nTranslation";
import { generateHrefLangs, getLocaleParams } from "@/lib/i18n/utils";
import { urls } from "@/lib/urls";
import { formatDate } from "@/utils/dates";
import { formatPostSource } from "@/utils/strings";

import { IndexPageLayout } from "@satoshi/components/IndexPageLayout";

export const dynamicParams = false;

const generateHref = (l: Locale) => urls(l).satoshi.posts.threadsIndex;

export async function generateMetadata({
  params: { locale },
}: LocaleParams): Promise<Metadata> {
  const { t } = await i18nTranslation(locale);
  const languages = generateHrefLangs([...locales], generateHref);

  return {
    title: t("Forum Threads"),
    alternates: { languages },
  };
}

export default async function PostThreadsIndex({
  params: { locale },
}: LocaleParams) {
  const threads = await getForumThreads();
  const sortedThreads = threads.reduce(
    (acc, thread) => {
      acc[thread.source].push(thread);
      return acc;
    },
    { p2pfoundation: [], bitcointalk: [] } as {
      [K in ForumPostSource]: ForumThread[];
    },
  );

  const navLinks = {
    main: {
      label: "View posts",
      href: urls(locale).satoshi.posts.index,
    },
    left: {
      label: formatPostSource("p2pfoundation"),
      href: urls(locale).satoshi.posts.sourceThreadsIndex("p2pfoundation"),
      sublink: {
        label: "Posts",
        href: urls(locale).satoshi.posts.sourceIndex("p2pfoundation"),
      },
    },
    right: {
      label: formatPostSource("bitcointalk"),
      href: urls(locale).satoshi.posts.sourceThreadsIndex("bitcointalk"),
      sublink: {
        label: "Posts",
        href: urls(locale).satoshi.posts.sourceIndex("bitcointalk"),
      },
    },
  };

  return (
    <IndexPageLayout
      title="Forum Threads"
      locale={locale}
      generateHref={generateHref}
      navLinks={navLinks}
    >
      <section>
        {Object.entries(sortedThreads).map(([source, sourceThreads]) => {
          const typedSource = source as ForumPostSource;
          return (
            <div key={typedSource} className="pb-4 last:pb-0">
              <h2 className="pb-2 text-3xl">{formatPostSource(typedSource)}</h2>
              <ul>
                {sourceThreads.map((thread) => (
                  <li key={thread.id}>
                    <Link
                      href={urls(locale).satoshi.posts.sourceThreadsDetail(
                        thread.source,
                        thread.id.toString(),
                      )}
                    >
                      {thread.title}
                    </Link>{" "}
                    <em>({formatDate(locale, thread.date)})</em>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </IndexPageLayout>
  );
}

export function generateStaticParams() {
  return getLocaleParams();
}
