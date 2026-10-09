import { useMemo, useState, useEffect, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPackagePricing } from "@/lib/pricing";

import { useAppDispatch, useAppSelector } from "@/store";
import { createBookingStart } from "@/store/slices/bookingSlice";
import { fetchPackageDetailsStart } from "@/store/slices/packagesSlice";

const BookingPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { submitting, success } = useAppSelector((state) => state.booking);
  const { selectedPackage, detailsLoading } = useAppSelector((state) => state.packages);

  useEffect(() => {
    if (id && (!selectedPackage || (selectedPackage._id !== id && selectedPackage.id !== id))) {
      dispatch(fetchPackageDetailsStart(id));
    }
  }, [id, dispatch, selectedPackage]);

  const pkg = selectedPackage;
  const [travelers, setTravelers] = useState(2);
  const [confirmed, setConfirmed] = useState(false);
  const today = new Date();
  const earliestDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const pricing = useMemo(() => (pkg ? getPackagePricing(pkg) : null), [pkg]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pkg && pricing) {
      dispatch(createBookingStart({ packageId: pkg.id || pkg._id, travelers, totalAmount: pricing.price * travelers }));
    }
    setConfirmed(true);
  };

  if (!pkg || !pricing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pb-20 pt-36 text-center">
          {detailsLoading ? (
            <div className="space-y-4">
              <div className="h-8 w-48 bg-muted rounded-full mx-auto animate-pulse" />
              <div className="h-32 max-w-lg bg-muted rounded-2xl mx-auto animate-pulse" />
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold text-foreground">Package not found</h1>
              <p className="mt-3 text-muted-foreground">Choose a trip from the packages page to continue.</p>
              <Button asChild className="mt-6"><Link to="/packages">Browse packages</Link></Button>
            </>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 pb-20 pt-32 lg:px-8">
        <Link to={`/packages/${pkg._id || pkg.id}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to {pkg.title || pkg.packageName}
        </Link>

        <div className="mb-8 max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase text-primary">Trip request</p>
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Plan your {pkg.location || pkg.destination} escape</h1>
          <p className="mt-3 text-muted-foreground">Choose your dates and traveler details. You can review the request before any reservation is made.</p>
        </div>

        {confirmed ? (
          <section className="max-w-2xl border-y border-border py-10 text-center" aria-live="polite">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"><CheckCircle className="h-7 w-7" /></div>
            <h2 className="font-display text-2xl font-bold text-foreground">Your trip details are ready</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">Your {pkg.title || pkg.packageName} request has been prepared for {travelers} {travelers === 1 ? "traveler" : "travelers"}. No payment or reservation has been submitted.</p>
            <div className="my-6 flex items-center justify-center gap-2 text-lg font-semibold text-foreground">Estimated total: ₹{pricing.price * travelers}</div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild><Link to={`/packages/${pkg._id || pkg.id}`}>Return to trip details</Link></Button>
              <Button variant="outline" onClick={() => setConfirmed(false)}>Edit details</Button>
            </div>
          </section>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="space-y-4 border-b border-border pb-8">
                <h2 className="font-display text-xl font-semibold text-foreground">Travel details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label className="space-y-2 text-foreground" htmlFor="travel-date">
                    <span>Travel date</span>
                    <Input id="travel-date" name="date" type="date" min={earliestDate} required />
                  </Label>
                  <Label className="space-y-2 text-foreground" htmlFor="travelers">
                    <span>Number of travelers</span>
                    <Input id="travelers" name="travelers" type="number" min={1} max={20} value={travelers} onChange={(event) => setTravelers(Math.min(20, Math.max(1, Number(event.target.value) || 1)))} required />
                  </Label>
                </div>
              </section>

              <section className="space-y-4 border-b border-border pb-8">
                <h2 className="font-display text-xl font-semibold text-foreground">Contact details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label className="space-y-2 text-foreground" htmlFor="full-name">
                    <span>Full name</span>
                    <Input id="full-name" name="name" autoComplete="name" placeholder="Your name" required />
                  </Label>
                  <Label className="space-y-2 text-foreground" htmlFor="email">
                    <span>Email address</span>
                    <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
                  </Label>
                  <Label className="space-y-2 text-foreground sm:col-span-2" htmlFor="phone">
                    <span>Phone number</span>
                    <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Your phone number" required />
                  </Label>
                </div>
              </section>

              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p>Your details are only used to prepare this trip request. Submitting here does not charge you or confirm a booking.</p>
              </div>
              <Button type="submit" size="lg" className="w-full border-0 gradient-accent text-accent-foreground sm:w-auto">Review trip request</Button>
            </form>

            <aside className="h-fit overflow-hidden rounded-xl border border-border bg-card">
              <img src={pkg.image} alt={pkg.title} className="aspect-[16/9] w-full object-cover" />
              <div className="space-y-5 p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{pkg.location} · {pkg.duration}</p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-foreground">{pkg.title}</h2>
                </div>
                <div className="space-y-2 border-y border-border py-4 text-sm">
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Price per person</span><span className="font-medium text-foreground">₹{pricing.price}</span></div>
                  {pricing.listPrice > pricing.price && <div className="flex justify-between gap-3"><span className="text-muted-foreground">Regular price</span><span className="text-muted-foreground line-through">₹{pricing.listPrice}</span></div>}
                  {pricing.offerCode && <div className="flex justify-between gap-3"><span className="text-muted-foreground">Offer applied</span><span className="font-medium text-primary">{pricing.offerCode}</span></div>}
                  <div className="flex justify-between gap-3 pt-2 text-base font-semibold"><span className="text-foreground">Estimated total</span><span className="text-foreground">₹{pricing.price * travelers}</span></div>
                  <p className="text-xs text-muted-foreground">For {travelers} {travelers === 1 ? "traveler" : "travelers"}; final details confirmed with the travel team.</p>
                </div>
                <ul className="space-y-2">
                  {pkg.included.slice(0, 4).map((item) => <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 shrink-0 text-primary" />{item}</li>)}
                </ul>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;