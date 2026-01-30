import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Star } from 'lucide-react';
import { Button } from './ui/button';

interface WinningCelebrationProps {
  show: boolean;
  onClose: () => void;
  problemTitle: string;
}

const confettiColors = [
  'hsl(142, 70%, 45%)', // primary green
  'hsl(210, 100%, 55%)', // accent blue
  'hsl(38, 92%, 50%)', // warning yellow
  'hsl(280, 70%, 60%)', // purple
  'hsl(0, 70%, 50%)', // red
];

export function WinningCelebration({ show, onClose, problemTitle }: WinningCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (show) {
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        delay: Math.random() * 0.5,
      }));
      setConfetti(particles);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Confetti */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {confetti.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ y: '100vh', x: `${particle.x}vw`, rotate: 0, opacity: 1 }}
                animate={{
                  y: '-10vh',
                  rotate: 720,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: particle.delay,
                  ease: 'easeOut',
                }}
                className="absolute w-3 h-3 rounded-sm"
                style={{ backgroundColor: particle.color }}
              />
            ))}
          </div>

          {/* Celebration Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative bg-card border border-border rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl" />
            
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-6"
              >
                <Trophy className="w-10 h-10 text-primary-foreground" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-warning" />
                  <h2 className="text-2xl font-bold text-gradient-primary">All Tests Passed!</h2>
                  <Sparkles className="w-5 h-5 text-warning" />
                </div>

                <p className="text-muted-foreground mb-6">
                  Congratulations! You've successfully solved
                  <br />
                  <span className="font-semibold text-foreground">"{problemTitle}"</span>
                </p>

                <div className="flex items-center justify-center gap-1 mb-6">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <Star className="w-6 h-6 text-warning fill-warning" />
                    </motion.div>
                  ))}
                </div>

                <Button variant="hero" size="lg" onClick={onClose}>
                  Continue Coding
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
