import { AnimatePresence, motion } from "framer-motion";

interface LoadingScreenProps {
  visible: boolean;
}

const LoadingScreen = ({ visible }: LoadingScreenProps) => {
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="global-loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeOut" } }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-background"
        >
          <div className="absolute inset-0">
            <div className="absolute left-[-8rem] top-[-6rem] h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-[-7rem] right-[-5rem] h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 text-center"
          >
            <img
              src="/favicon.png"
              alt="dotravels Logo"
              width={64}
              height={64}
              style={{
                width: "64px",
                height: "64px",
                minWidth: "64px",
                minHeight: "64px",
                maxWidth: "64px",
                maxHeight: "64px",
                objectFit: "contain",
              }}
              className="mb-4 shrink-0 rounded-2xl shadow-glass"
            />
            <h2 className="font-display text-3xl font-bold text-foreground">dotravels</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Loading a smoother travel experience for your next journey.
            </p>

            <div className="mt-7 h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
                className="h-full w-full rounded-full gradient-accent"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
