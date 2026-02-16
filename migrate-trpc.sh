#!/bin/bash
# Migrate all tRPC calls to direct Sanity hooks
cd /Users/elliefoxes/.openclaw/workspace/the-triton

# For each file, replace trpc imports and calls
for f in client/src/pages/*.tsx client/src/components/*.tsx; do
  if grep -q "trpc" "$f" 2>/dev/null; then
    echo "Processing: $f"
    
    # Remove trpc import
    sed -i '' 's|import { trpc } from "@/lib/trpc";||g' "$f"
    
    # Replace trpc.articles.list.useQuery({ limit: N })
    sed -i '' 's|trpc\.articles\.list\.useQuery({ limit: \([0-9]*\) })|useArticles(\1)|g' "$f"
    sed -i '' 's|trpc\.articles\.list\.useQuery()|useArticles()|g' "$f"
    
    # Replace trpc.articles.bySlug.useQuery({ slug: ... })
    sed -i '' 's|trpc\.articles\.bySlug\.useQuery({ slug: slug || "" })|useArticleBySlug(slug || "")|g' "$f"
    sed -i '' 's|trpc\.articles\.bySlug\.useQuery({ slug: slug! })|useArticleBySlug(slug || "")|g' "$f"
    
    # Replace trpc.articles.byCategory.useQuery(...)
    # Handle multiline and various patterns
    sed -i '' 's|trpc\.articles\.byCategory\.useQuery({|useArticlesByCategory_RAW({|g' "$f"
    
    # Replace trpc.articles.search
    sed -i '' 's|trpc\.articles\.search\.useQuery({ query: \(.*\), limit: \([0-9]*\) })|useSearchArticles(\1, \2)|g' "$f"
    sed -i '' 's|trpc\.articles\.search\.useQuery|useSearchArticles_RAW|g' "$f"
    
    # Replace trpc.articles.trending
    sed -i '' 's|trpc\.articles\.trending\.useQuery({ limit: \([0-9]*\) })|useTrendingArticles(\1)|g' "$f"
    sed -i '' 's|trpc\.articles\.trending\.useQuery()|useTrendingArticles()|g' "$f"
    
    # Replace trpc.authors.*
    sed -i '' 's|trpc\.authors\.bySlug\.useQuery({ slug: \(.*\) })|useAuthorBySlug(\1)|g' "$f"
    sed -i '' 's|trpc\.authors\.articles\.useQuery|useArticlesByAuthor_RAW|g' "$f"
    
    # Replace trpc.events.list
    sed -i '' 's|trpc\.events\.list\.useQuery()|useEvents()|g' "$f"
    
    # Replace trpc.magazines.list
    sed -i '' 's|trpc\.magazines\.list\.useQuery()|useMagazineIssues()|g' "$f"
    
    # Replace trpc.videos.byCategory
    sed -i '' 's|trpc\.videos\.byCategory\.useQuery({|useFeaturedVideo_RAW({|g' "$f"
    
    # Replace trpc.banners.*
    sed -i '' 's|trpc\.banners\.byPageAndPosition\.useQuery|useBannerAd_RAW|g' "$f"
    sed -i '' 's|trpc\.banners\.trackImpression\.useMutation|useTrackImpression_STUB|g' "$f"
    sed -i '' 's|trpc\.banners\.trackClick\.useMutation|useTrackClick_STUB|g' "$f"
    
    # Replace trpc.analytics.*
    sed -i '' 's|trpc\.analytics\.allAdvertisements\.useQuery()|useAllAdvertisements()|g' "$f"
    
    # Replace trpc.ai.chat
    sed -i '' 's|trpc\.ai\.chat\.useMutation|useAIChat_STUB|g' "$f"
  fi
done

echo "Done. Now need manual fixes for _RAW and _STUB patterns."
