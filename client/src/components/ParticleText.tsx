import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  originX: number;
  originY: number;
  size: number;
  color: string;
  alpha: number;
  vx: number;
  vy: number;
}

export default function ParticleText({ title = "Mystery Boxes Await" }: { title?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const [phase, setPhase] = useState<"sphere" | "dispersing" | "forming" | "text">("sphere");
  const [showButton, setShowButton] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });

  const createParticles = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const isMobile = window.innerWidth < 768;
    const sphereRadius = isMobile ? 80 : 120;
    const particleCount = isMobile ? 1500 : 3000;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = sphereRadius * Math.cbrt(Math.random());
      
      const x = centerX + r * Math.sin(phi) * Math.cos(theta);
      const y = centerY + r * Math.sin(phi) * Math.sin(theta);
      
      const hue = 270 + Math.random() * 30;
      const saturation = 70 + Math.random() * 30;
      const lightness = 60 + Math.random() * 30;
      
      particles.push({
        x,
        y,
        targetX: x,
        targetY: y,
        originX: x,
        originY: y,
        size: Math.random() * 2 + 0.5,
        color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
        alpha: 0.6 + Math.random() * 0.4,
        vx: 0,
        vy: 0,
      });
    }

    particlesRef.current = particles;
  }, []);

  const getTextPositions = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const isMobile = window.innerWidth < 768;
    const fontSize = isMobile ? 36 : 72;
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const words = title.split(" ");
    const lineHeight = fontSize * 1.2;
    const totalHeight = words.length * lineHeight;
    const startY = canvas.height / 2 - totalHeight / 2 + lineHeight / 2;
    
    ctx.fillStyle = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    words.forEach((word, index) => {
      ctx.fillText(word, canvas.width / 2, startY + index * lineHeight);
    });
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const positions: { x: number; y: number }[] = [];
    const gap = isMobile ? 3 : 2;
    
    for (let y = 0; y < canvas.height; y += gap) {
      for (let x = 0; x < canvas.width; x += gap) {
        const index = (y * canvas.width + x) * 4;
        if (imageData.data[index + 3] > 128) {
          positions.push({ x, y });
        }
      }
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return positions;
  }, [title]);

  const disperseParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    particlesRef.current.forEach((particle) => {
      const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
      const distance = 200 + Math.random() * 300;
      particle.targetX = centerX + Math.cos(angle) * distance;
      particle.targetY = centerY + Math.sin(angle) * distance;
      particle.vx = (Math.random() - 0.5) * 10;
      particle.vy = (Math.random() - 0.5) * 10;
    });
  }, []);

  const formText = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const textPositions = getTextPositions(canvas, ctx);
    const particles = particlesRef.current;
    
    const neededParticles = textPositions.length;
    const availableParticles = particles.length;
    
    for (let i = 0; i < availableParticles; i++) {
      if (i < neededParticles) {
        particles[i].targetX = textPositions[i].x;
        particles[i].targetY = textPositions[i].y;
      } else {
        const randomPos = textPositions[Math.floor(Math.random() * textPositions.length)];
        if (randomPos) {
          particles[i].targetX = randomPos.x + (Math.random() - 0.5) * 20;
          particles[i].targetY = randomPos.y + (Math.random() - 0.5) * 20;
        } else {
          particles[i].targetX = canvas.width / 2 + (Math.random() - 0.5) * 100;
          particles[i].targetY = canvas.height / 2 + (Math.random() - 0.5) * 100;
        }
      }
    }
  }, [getTextPositions]);

  const handleClick = useCallback(() => {
    if (phase === "sphere") {
      setPhase("dispersing");
      disperseParticles();
      
      setTimeout(() => {
        setPhase("forming");
        formText();
      }, 800);
      
      setTimeout(() => {
        setPhase("text");
        setShowButton(true);
      }, 2500);
    }
  }, [phase, disperseParticles, formText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        createParticles(canvas, ctx);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    
    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [createParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.width / dpr;
    const displayHeight = canvas.height / dpr;

    const animate = () => {
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      
      const particles = particlesRef.current;
      const easing = phase === "dispersing" ? 0.08 : phase === "forming" ? 0.05 : 0.1;
      
      particles.forEach((particle) => {
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        
        particle.vx += dx * easing;
        particle.vy += dy * easing;
        particle.vx *= 0.85;
        particle.vy *= 0.85;
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.fill();
      });
      
      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [phase]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || phase !== "sphere") return;
      
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [phase]);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-neutral-950"
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className={`absolute inset-0 ${phase === "sphere" ? "cursor-pointer" : ""}`}
        data-testid="canvas-particle-animation"
      />
      
      {phase === "sphere" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute z-10 text-center pointer-events-none"
        >
          <p className="text-white/60 text-lg mt-40">Click to reveal</p>
        </motion.div>
      )}

      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute z-20 mt-64"
          >
            <div
              className="inline-block group relative bg-gradient-to-b from-white/10 to-black/10 
              p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <Link href="/shop">
                <Button
                  variant="ghost"
                  className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                  bg-black/95 hover:bg-black/100 text-white transition-all duration-300 
                  group-hover:-translate-y-0.5 border border-white/10
                  hover:shadow-md hover:shadow-neutral-800/50"
                  data-testid="button-discover-excellence"
                >
                  <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                    Experience The Ultimate
                  </span>
                  <span
                    className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                    transition-all duration-300"
                  >
                    →
                  </span>
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showButton ? 1 : 0, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            document.getElementById('about-us')?.scrollIntoView({ 
              behavior: 'smooth' 
            });
          }}
          className="rounded-full bg-black/80 backdrop-blur-sm
          border border-white/10 hover:bg-black animate-bounce"
          data-testid="button-scroll-to-about"
        >
          <ChevronDown className="h-5 w-5 text-white" />
        </Button>
      </motion.div>
    </div>
  );
}
