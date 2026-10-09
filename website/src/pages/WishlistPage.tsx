import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Trash2, MapPin, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchWishlistStart } from "@/store/slices/wishlistSlice";

const WishlistPage = () => {
  const { items, removeItem } = useWishlist();
  const dispatch = useAppDispatch();
  const reduxWishlist = useAppSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlistStart());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 md:pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">My Wishlist</h1>
              <p className="text-muted-foreground mt-1">{items.length} saved {items.length === 1 ? "package" : "packages"}</p>
            </div>
            <Heart className="w-8 h-8 text-accent" />
          </div>

          {items.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-card rounded-2xl shadow-card">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-semibold text-xl text-foreground mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-6">Browse our packages and save the ones you love!</p>
              <Link to="/packages"><Button className="gradient-accent text-accent-foreground border-0">Explore Packages</Button></Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-2xl shadow-card overflow-hidden flex flex-col sm:flex-row hover-lift"
                >
                  <Link to={`/packages/${item.id}`} className="sm:w-48 md:w-56 aspect-video sm:aspect-auto shrink-0 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <div className="p-5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <Link to={`/packages/${item.id}`} className="font-display font-semibold text-foreground hover:text-accent transition-colors">{item.title}</Link>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{item.location}</p>
                      <p className="text-lg font-display font-bold text-foreground mt-2">₹{item.price}<span className="text-sm text-muted-foreground font-normal"> /person</span></p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link to={`/packages/${item.id}`}>
                        <Button size="sm" className="gradient-accent text-accent-foreground border-0 hover:opacity-90">Book Now</Button>
                      </Link>
                      <Button size="sm" variant="outline" onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WishlistPage;
