import { useEffect } from "react";
import { useParams } from "react-router-dom";
import PlannerWorkspace from "@/components/planner/PlannerWorkspace";

export default function PlannerPage() {
  const { threadId } = useParams();

  useEffect(() => {
    document.title = "AI Trip Studio & Live Route Map | dotravels";
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
      <PlannerWorkspace activeThreadId={threadId} />
    </div>
  );
}