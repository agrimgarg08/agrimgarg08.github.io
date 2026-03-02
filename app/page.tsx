import { Navbar } from "@/components/navbar"
import { CustomCursor } from "@/components/custom-cursor"
import { HeroSection } from "@/components/sections/hero"
import { AboutSection } from "@/components/sections/about"
import { TechStackSection } from "@/components/sections/tech-stack"
import { ResumeSection } from "@/components/sections/resume"
import { EducationSection } from "@/components/sections/education"
import { AchievementsSection } from "@/components/sections/achievements"
import { CodingStatsSection } from "@/components/sections/coding-stats"
import { ProjectsSection } from "@/components/sections/projects"
import { ContactSection } from "@/components/sections/contact"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <TechStackSection />
        <ResumeSection />
        <EducationSection />
        <AchievementsSection />
        <CodingStatsSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
