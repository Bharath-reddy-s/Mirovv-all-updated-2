import Navbar from "@/components/Navbar";
import BackgroundPaths from "@/components/BackgroundPaths";
import { Card, CardContent } from "@/components/ui/card";
import { SplineScene } from "@/components/SplineScene";

export default function Home() {
  return (
    <>
      <Navbar />
      <BackgroundPaths title="Mystery Boxes Await" />
      
      <section className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-5xl font-bold text-center mb-12 text-black dark:text-white" data-testid="heading-about-us">
            About Us
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-8">
              <Card className="hover-elevate" data-testid="card-about-description">
                <CardContent className="p-8">
                  <p className="text-left text-base leading-relaxed text-foreground">
                    We sell Mystery Boxes that include a surprise item, a letter, and a lucky draw ticket that gives you free entry into our exclusive giveaway. Winners are picked live on Instagram every few days, and prizes may include earphones, AirPods, and more — depending on the box you choose.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate" data-testid="card-about-goal">
                <CardContent className="p-8">
                  <p className="text-left text-lg font-semibold text-foreground">
                    Our goal is to help fulfil students' dreams through our exclusive giveaways.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full h-[500px] lg:h-[600px] rounded-md overflow-hidden" data-testid="container-spline">
              <SplineScene 
                scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
