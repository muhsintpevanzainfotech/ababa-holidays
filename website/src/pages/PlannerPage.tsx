import { useParams } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PlannerWorkspace from "@/components/planner/PlannerWorkspace";
import { useAppDispatch, useAppSelector } from "@/store";

export default function PlannerPage() {
  const { threadId } = useParams();
  const dispatch = useAppDispatch();
  const plannerStatus = useAppSelector((state) => state.search.plannerStatus);

  return (
    <div className="min-h-screen bg-background pt-32">
      <Navbar />
      <main className="container mx-auto px-4 pb-16 pt-8 lg:px-8 lg:pb-24">
        <div className="mb-7 max-w-3xl">
          <span className="mb-3 inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">AI TRIP STUDIO</span>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-5xl">Your journey, shaped together.</h1>
          <p className="mt-3 text-muted-foreground">Chat with Nila, watch your destination come alive, and keep every trip ready for later.</p>
        </div>
        <PlannerWorkspace activeThreadId={threadId} />
      </main>
      <Footer />
    </div>
  );
}