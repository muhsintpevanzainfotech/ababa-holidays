import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Share2,
  Bookmark,
  CheckCircle2,
  Quote,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Send,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchBlogDetailsStart, fetchBlogsStart } from "@/store/slices/blogsSlice";

import { getImageUrl } from "@/lib/imageHelper";

const BlogDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { selectedBlog, blogs } = useAppSelector((state) => state.blogs);

  useEffect(() => {
    dispatch(fetchBlogsStart());
    if (slug) {
      dispatch(fetchBlogDetailsStart(slug));
    }
  }, [slug, dispatch]);

  const rawPost = selectedBlog || (Array.isArray(blogs) ? blogs.find((p: any) => p.slug === slug || p._id === slug || p.id === slug) : null);

  const post = rawPost ? {
    id: rawPost._id || rawPost.id,
    title: rawPost.title || "Travel Story",
    category: rawPost.category || "Travel Guide",
    excerpt: rawPost.excerpt || (rawPost.seo as any)?.description || (typeof rawPost.content === "string" ? rawPost.content.substring(0, 160) + "..." : "Explore travel tips, destinations, and local culture."),
    coverImage: getImageUrl(rawPost.coverImage || (rawPost as any).image),
    publishedDate: rawPost.publishedDate || ((rawPost as any).createdAt ? new Date((rawPost as any).createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"),
    readTime: rawPost.readTime || "5 min read",
    author: {
      name: typeof rawPost.author === "object" ? rawPost.author?.name || "Ababa Travel Desk" : (rawPost.author || "Ababa Travel Desk"),
      role: typeof rawPost.author === "object" ? rawPost.author?.role || "Verified Guide" : "Verified Guide",
      avatar: getImageUrl(typeof rawPost.author === "object" ? (rawPost.author as any)?.avatar : undefined),
    },
    tags: Array.isArray(rawPost.tags) ? rawPost.tags : ((rawPost.seo as any)?.keywords || ["Travel", "Guide", "Kerala"]),
    content: (rawPost as any).content as any,
  } : null;

  const relatedPosts = Array.isArray(blogs)
    ? blogs
        .filter((p: any) => p.slug !== slug && (p._id || p.id) !== (rawPost?._id || rawPost?.id))
        .slice(0, 3)
        .map((rel: any) => ({
          id: rel._id || rel.id || rel.slug,
          slug: rel.slug || rel._id,
          title: rel.title || "Travel Guide",
          category: rel.category || "Travel Guide",
          coverImage: getImageUrl(rel.coverImage || rel.image),
        }))
    : [];

  const handleShare = () => {
    if (!post) return;
    if (navigator.share) {
      navigator.share({ title: post.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied!", description: "Article link copied to clipboard." });
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center space-y-4">
          <h2 className="font-display text-2xl font-bold text-foreground">Loading Travel Guide...</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Fetching article details from Ababa Travel Network.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-24 sm:pt-28 pb-6 bg-background text-foreground">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground truncate max-w-[200px] sm:max-w-[300px]">{post.title}</span>
          </div>

          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold uppercase tracking-wider">
              {post.category}
            </span>

            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
              {post.title}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>

            {/* Author & Meta bar */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border/60">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/favicon.png";
                  }}
                  className="h-10 w-10 rounded-full object-cover border-2 border-accent"
                />
                <div>
                  <p className="text-xs font-bold text-foreground">{post.author.name}</p>
                  <p className="text-[11px] text-muted-foreground">{post.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  {post.readTime}
                </span>
                <span>•</span>
                <span>{post.publishedDate}</span>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-full border-border bg-muted/40 text-foreground hover:bg-muted text-xs"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="container mx-auto px-4 lg:px-8 py-10 max-w-4xl space-y-10">
        {/* Cover Image */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 shadow-lg aspect-[16/9] max-h-[380px] sm:max-h-[420px]">
          <img
            src={post.coverImage}
            alt={post.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/favicon.png";
            }}
            className="h-full w-full object-cover"
          />
        </div>

        {/* If blog content is a raw string (e.g. backend rich text or HTML) */}
        {typeof rawPost.content === "string" ? (
          <div className="prose dark:prose-invert max-w-none text-base leading-relaxed space-y-4">
            <div dangerouslySetInnerHTML={{ __html: rawPost.content }} />
          </div>
        ) : (
          <>
            {/* Key Takeaways Box */}
            {post.content?.keyTakeaways && post.content.keyTakeaways.length > 0 && (
              <div className="rounded-3xl border border-accent/30 bg-accent/5 p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <h2 className="font-display text-lg font-bold text-foreground">Key Takeaways & Highlights</h2>
                </div>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {post.content.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Article Intro */}
            {post.content?.intro && (
              <div className="text-base sm:text-lg leading-relaxed text-foreground font-medium border-l-4 border-accent pl-4 py-1">
                {post.content.intro}
              </div>
            )}

            {/* Article Sections */}
            {post.content?.sections && (
              <div className="space-y-8">
                {post.content.sections.map((section, idx) => (
                  <div key={idx} className="space-y-4">
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      {section.heading}
                    </h2>
                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                      {section.body}
                    </p>

                    {section.quote && (
                      <blockquote className="my-4 rounded-2xl border border-border/60 bg-muted/40 p-5 italic text-sm sm:text-base text-foreground flex items-start gap-3">
                        <Quote className="h-6 w-6 text-accent shrink-0 rotate-180" />
                        <span>"{section.quote}"</span>
                      </blockquote>
                    )}

                    {section.image && (
                      <div className="my-4 overflow-hidden rounded-2xl border border-border/80 aspect-[16/9]">
                        <img
                          src={getImageUrl(section.image)}
                          alt={section.heading}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/favicon.png";
                          }}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Conclusion */}
            {post.content?.conclusion && (
              <div className="rounded-3xl surface-panel p-6 sm:p-8 space-y-3">
                <h3 className="font-display text-lg font-bold text-foreground">Final Thoughts</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {post.content.conclusion}
                </p>
              </div>
            )}
          </>
        )}

        {/* Tags & Author Bio Box */}
        <div className="space-y-6 pt-6 border-t border-border/60">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground mr-1">Tags:</span>
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-card p-5">
            <img
              src={post.author?.avatar || "/favicon.png"}
              alt={post.author?.name || "Author"}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/favicon.png";
              }}
              className="h-12 w-12 rounded-full object-cover border-2 border-accent shrink-0"
            />
            <div>
              <p className="text-sm font-bold text-foreground">{post.author?.name || "Travel Editor"}</p>
              <p className="text-xs text-accent font-medium mb-1">{post.author?.role || "Editorial"}</p>
              <p className="text-xs text-muted-foreground">Travel storyteller & destination curator bringing you verified travel recommendations across India and abroad.</p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="space-y-6 pt-8 border-t border-border/60">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-foreground">Related Travel Guides</h3>
            <Link to="/blog" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.id}
                to={`/blog/${rel.slug}`}
                className="group rounded-2xl border border-border/80 bg-card p-3 space-y-2 transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="aspect-[16/10] overflow-hidden rounded-xl">
                  <img src={rel.coverImage} alt={rel.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <span className="text-[10px] font-bold uppercase text-accent">{rel.category}</span>
                <h4 className="font-display text-xs font-bold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                  {rel.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetailsPage;
