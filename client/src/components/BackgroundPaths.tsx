import { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";

function FloatingPaths({ position }: { position: number }) {
    const paths = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 10 * position} -${189 + i * 12}C-${
            380 - i * 10 * position
        } -${189 + i * 12} -${312 - i * 10 * position} ${216 - i * 12} ${
            152 - i * 10 * position
        } ${343 - i * 12}C${616 - i * 10 * position} ${470 - i * 12} ${
            684 - i * 10 * position
        } ${875 - i * 12} ${684 - i * 10 * position} ${875 - i * 12}`,
        width: 0.5 + i * 0.05,
        opacity: 0.1 + i * 0.04,
        duration: 20 + i * 2,
    })), [position]);

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-slate-950 dark:text-white"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={path.opacity}
                        initial={{ pathLength: 0.3, opacity: 0.4 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.2, 0.5, 0.2],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: path.duration,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export default function BackgroundPaths({
    title = "Background Paths",
}: {
    title?: string;
}) {
    const words = title.split(" ");

    return (
        <div className="relative min-h-[calc(100vh-120px)] w-full flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
            <div className="absolute inset-0 -top-24 sm:-top-16 md:top-0 flex items-center justify-center">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>
            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center -mt-24 sm:-mt-16 md:mt-0">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter mt-[100px] mb-[100px]">
                        {words.map((word, wordIndex) => (
                            <span key={wordIndex}>
                                <motion.span
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        delay: wordIndex * 0.2,
                                        duration: 0.6,
                                        ease: "easeOut",
                                    }}
                                    className="inline-block mr-4 last:mr-0 text-transparent bg-clip-text 
                                    bg-gradient-to-r from-neutral-900 to-neutral-700/80 
                                    dark:from-white dark:to-white/80"
                                >
                                    {word}
                                </motion.span>
                                {wordIndex === 0 && <br />}
                            </span>
                        ))}
                    </h1>

                    <div
                        className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 
                        dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
                        overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                        <Link href="/shop">
                            <Button
                                variant="ghost"
                                className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                                bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 
                                text-black dark:text-white transition-all duration-300 
                                group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
                                hover:shadow-md dark:hover:shadow-neutral-800/50 pl-[20px] pr-[20px] pt-[9px] pb-[9px]"
                                data-testid="button-discover-excellence"
                            >
                                <span className="opacity-90 group-hover:opacity-100 transition-opacity font-semibold bg-[transparent] ml-[0px] mr-[0px] mt-[0px] mb-[0px] pt-[0px] pb-[0px]">Explore  us</span>
                                <span
                                    className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                    transition-all duration-300"
                                >
                                    →
                                </span>
                            </Button>
                        </Link>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="flex justify-center mt-8"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                document.getElementById('about-us')?.scrollIntoView({ 
                                    behavior: 'smooth' 
                                });
                            }}
                            className="rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm
                            border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-black
                            animate-bounce"
                            data-testid="button-scroll-to-about"
                        >
                            <ChevronDown className="h-5 w-5 text-black dark:text-white" />
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
