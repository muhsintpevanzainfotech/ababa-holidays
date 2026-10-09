import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Clock, ArrowRight, Sparkles, BookOpen, User, Tag, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchBlogsStart } from "@/store/slices/blogsSlice";

const categories = ["All", "Kerala", "Guides", "Tips", "Hotels", "Visa", "Transport"];

import { getImageUrl } from "@/lib/imageHelper";

const BlogPage = () => {
  const dispatch = useAppDispatch();
  const { blogs: reduxBlogs, loading } = useAppSelector((state) => state.blogs);

  useEffect(() => {
    dispatch(fetchBlogsStart());
  }, [dispatch]);

  const activeBlogsList: any[] = Array.isArray(reduxBlogs) ? reduxBlogs : [];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = activeBlogsList.filter((post: any) => {
    const postTitle = post.title || "";
    const postExcerpt = post.excerpt || post.seo?.description || (typeof post.content === "string" ? post.content : "");
    const postTags = Array.isArray(post.tags) ? post.tags : (post.seo?.keywords || []);

    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      postTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      postExcerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      postTags.some((tag: string) => String(tag).toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = activeBlogsList.find((p: any) => p.featured || p.isFeatured) || activeBlogsList[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-24 sm:pt-28 pb-6 bg-background text-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5" /> Travel Insights & Guides
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Discover Stories, Insider Tips & Travel Inspiration
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Read curated travel advice, houseboat cruise guides, visa regulations, and top destination itineraries.
            </p>

            {/* Search Bar */}
            <div className="pt-2 max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, Kerala backwaters, Dubai visas..."
                className="h-12 pl-11 pr-4 rounded-full border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-accent text-accent-foreground shadow-md scale-105"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 lg:px-8 py-10 space-y-12">
        {/* Featured Post Card (Show when All category & no search query) */}
        {selectedCategory === "All" && !searchQuery && featuredPost && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Featured Article</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg lg:grid lg:grid-cols-12 items-center"
            >
              <div className="relative h-[220px] sm:h-[280px] lg:h-[320px] lg:col-span-5 overflow-hidden">
                <img
                  src={getImageUrl(featuredPost.coverImage || (featuredPost as any).image)}
                  alt={featuredPost.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/favicon.png";
                  }}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-sm">
                  {featuredPost.category || "Featured"}
                </span>
              </div>

              <div className="p-6 sm:p-8 lg:p-8 lg:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-accent" />
                      {featuredPost.readTime || "5 min read"}
                    </span>
                    <span>•</span>
                    <span>{featuredPost.publishedDate || ((featuredPost as any).createdAt ? new Date((featuredPost as any).createdAt).toLocaleDateString() : "Recently")}</span>
                  </div>

                  <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-snug group-hover:text-accent transition-colors">
                    <Link to={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {featuredPost.excerpt || (featuredPost as any).seo?.description || (typeof (featuredPost as any).content === "string" ? String((featuredPost as any).content).substring(0, 160) + "..." : "")}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/60">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={getImageUrl(typeof featuredPost.author === "object" ? (featuredPost.author as any)?.avatar : undefined)}
                      alt={typeof featuredPost.author === "object" ? featuredPost.author?.name || "Author" : "Author"}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/favicon.png";
                      }}
                      className="h-8 w-8 rounded-full object-cover border border-border"
                    />
                    <div className="text-left leading-tight">
                      <p className="text-xs font-bold text-foreground">{typeof featuredPost.author === "object" ? featuredPost.author?.name || "Travel Editor" : "Travel Editor"}</p>
                      <p className="text-[10px] text-muted-foreground">{typeof featuredPost.author === "object" ? featuredPost.author?.role || "Editorial" : "Editorial"}</p>
                    </div>
                  </div>

                  <Link to={`/blog/${featuredPost.slug}`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 rounded-full text-accent hover:text-accent font-semibold">
                      <span>Read Article</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              {selectedCategory === "All" ? "Latest Travel Articles" : `${selectedCategory} Articles`}
            </h2>
            <span className="text-xs text-muted-foreground font-medium">
              Showing {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-[340px] rounded-2xl bg-muted/60 animate-pulse border border-border/40" />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 surface-panel rounded-3xl space-y-3">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="font-display text-lg font-bold text-foreground">No articles found</h3>
              <p className="text-xs text-muted-foreground">Try adjusting your search terms or filter category.</p>
              <Button onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }} variant="outline" className="rounded-full text-xs">
                Clear Search Filter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post: any, index: number) => {
                const postId = post.id || post._id || `blog-${index}`;
                const postTitle = post.title || "Travel Story";
                const postCover = getImageUrl(post.coverImage || post.image);
                const postCategory = post.category || "Guide";
                const postReadTime = post.readTime || "5 min read";
                const postDate = post.publishedDate || (post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently");
                const postExcerpt = post.excerpt || post.seo?.description || (typeof post.content === "string" ? post.content.substring(0, 140) + "..." : "");
                const authorName = typeof post.author === "object" ? post.author?.name || "Travel Editor" : "Travel Editor";
                const authorAvatar = getImageUrl(typeof post.author === "object" ? post.author?.avatar : undefined);

                return (
                  <motion.article
                    key={postId}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={postCover}
                          alt={postTitle}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/favicon.png";
                          }}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-foreground border border-border/40">
                          {postCategory}
                        </span>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-accent" />
                            {postReadTime}
                          </span>
                          <span>•</span>
                          <span>{postDate}</span>
                        </div>

                        <h3 className="font-display text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                          <Link to={`/blog/${post.slug}`}>
                            {postTitle}
                          </Link>
                        </h3>

                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {postExcerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between border-t border-border/40 mt-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={authorAvatar}
                          alt={authorName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/favicon.png";
                          }}
                          className="h-6 w-6 rounded-full object-cover border border-border"
                        />
                        <span className="text-xs font-medium text-muted-foreground">{authorName}</span>
                      </div>

                      <Link to={`/blog/${post.slug}`} className="flex items-center gap-1 text-xs font-bold text-accent hover:underline">
                        <span>Read</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;
