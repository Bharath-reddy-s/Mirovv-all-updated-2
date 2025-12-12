import { useTryNowChallenge } from "@/contexts/TryNowChallengeContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, PartyPopper, Timer } from "lucide-react";
import { motion } from "framer-motion";

export function TryNowChallengePopup() {
  const { challengeStatus, challengeType, dismissPopup } = useTryNowChallenge();

  const isOpen = challengeStatus === "completed" || challengeStatus === "failed";

  const handleClose = () => {
    dismissPopup();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0">
        {challengeStatus === "completed" ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-green-400 to-green-600 p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <PartyPopper className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Challenge Completed!</h2>
                <PartyPopper className="w-6 h-6 text-white" />
              </div>
              <p className="text-white/90 mb-6">
                Congratulations! You completed the {challengeType === "timer" ? "Timer Challenge" : "Flash Challenge"} successfully!
              </p>
              <Button
                onClick={handleClose}
                className="bg-white text-green-600 hover:bg-white/90 font-semibold px-8"
                data-testid="button-dismiss-success"
              >
                Awesome!
              </Button>
            </motion.div>
          </motion.div>
        ) : challengeStatus === "failed" ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-red-400 to-red-600 p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Timer className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Challenge Failed!</h2>
              </div>
              <p className="text-white/90 mb-6">
                Time's up! You didn't complete the {challengeType === "timer" ? "Timer Challenge" : "Flash Challenge"} in time. Better luck next time!
              </p>
              <Button
                onClick={handleClose}
                className="bg-white text-red-600 hover:bg-white/90 font-semibold px-8"
                data-testid="button-dismiss-failure"
              >
                Try Again Later
              </Button>
            </motion.div>
          </motion.div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
