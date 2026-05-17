import { reviews } from '../state';

interface AggregateRating {
  '@type': 'AggregateRating';
  ratingValue: string;
  reviewCount: number;
  bestRating: number;
  worstRating: number;
}

interface ReviewSchema {
  '@type': 'Review';
  author: { '@type': 'Person'; name: string };
  datePublished: string;
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating: number;
  };
  reviewBody: string;
}

interface BusinessSchema {
  aggregateRating?: AggregateRating;
  review?: ReviewSchema[];
  [key: string]: unknown;
}

export function injectReviewSchema(): void {
  const node = document.getElementById('business-schema');
  if (!node) return;

  let schema: BusinessSchema;
  try {
    schema = JSON.parse(node.textContent ?? '') as BusinessSchema;
  } catch (e) {
    console.error('[kushnir] schema parse failed', e);
    return;
  }

  const { summary, items } = reviews;
  schema.aggregateRating = {
    '@type': 'AggregateRating',
    ratingValue: summary.rating.toFixed(1),
    reviewCount: summary.count,
    bestRating: summary.best_rating,
    worstRating: 1,
  };
  schema.review = items.slice(0, 12).map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.author },
    datePublished: r.date,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: r.rating || 5,
      bestRating: summary.best_rating,
    },
    reviewBody: r.text,
  }));
  node.textContent = JSON.stringify(schema);
}
