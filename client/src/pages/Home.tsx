import Navbar from "@/components/Navbar";
import BackgroundPaths from "@/components/BackgroundPaths";
import { Card, CardContent } from "@/components/ui/card";
import videoSrc from "@assets/_ copy_1763317377238.mp4";

export default function Home() {
  return (
    <>
      <Navbar />
      <BackgroundPaths title="Mystery Boxes Await" />
      
      <section id="about-us" className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-5xl font-bold text-center mb-12 text-black dark:text-white" data-testid="heading-about-us">
            About Us
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="hover-elevate flex flex-col" data-testid="card-about-description">
              <CardContent className="p-8 space-y-6 flex-1 flex flex-col justify-center">
                <p className="text-left text-base leading-relaxed text-foreground">
                  We sell Mystery Boxes that include a surprise item, a letter, and a lucky draw ticket that gives you free entry into our exclusive giveaway. Winners are picked live on Instagram every few days, and prizes may include earphones, AirPods, and more — depending on the box you choose.
                </p>
                
                <p className="text-center text-lg font-semibold text-foreground">
                  Our goal is to get a smile on your face with every order
                </p>
              </CardContent>
            </Card>
            
            <div className="w-full rounded-md overflow-hidden bg-black flex items-center justify-center" data-testid="container-video">
              <video
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
                data-testid="video-mystery-box"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
