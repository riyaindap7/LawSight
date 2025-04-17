"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion"
import { ChevronDown, Globe, Mic, Shield, FileText, Users, Menu, X, Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

const MotionButton = motion(Button)
const MotionLink = motion(Link)

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const [scrollY, setScrollY] = useState(0)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [showDropdown, setShowDropdown] = useState(false);
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const languageRef = useRef(null)
  const ipcRef = useRef(null)
  const speechRef = useRef(null)
  const testimonialsRef = useRef(null)
  const ctaRef = useRef(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
 
  const { scrollYProgress } = useScroll()
  const smoothScrollYProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const opacity = useTransform(smoothScrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(smoothScrollYProgress, [0, 0.2], [1, 0.9])
  const heroY = useTransform(smoothScrollYProgress, [0, 0.2], [0, -50])

  // Parallax effect for hero section
  const heroParallax = useTransform(smoothScrollYProgress, [0, 1], [0, -300])
  const heroOpacity = useTransform(smoothScrollYProgress, [0, 0.3], [1, 0])

  // Mouse movement effect for spotlight
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })

      if (spotlightRef.current) {
        const rect = spotlightRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setMousePosition({ x, y })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Testimonials data
  const testimonials = [
    {
      name: "Chief John Smith",
      role: "Police Department",
      content: "This assistant has revolutionized how our officers handle documentation and case management.",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
    },
    {
      name: "Officer Maria Rodriguez",
      role: "Field Operations",
      content: "The speech-to-text feature saves me hours of paperwork after each shift.",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
    },
    {
      name: "Detective Alex Chen",
      role: "Investigations Unit",
      content: "IPC prediction has improved our case filing accuracy by 45% in just three months.",
      image: "/placeholder.svg?height=60&width=60",
      rating: 4,
    },
  ]

  // Features data
  const features = [
    {
      title: "Multilanguage Support",
      description: "Communicate effectively with citizens in over 50 languages with real-time translation.",
      icon: <Globe className="h-8 w-8" />,
      color: "from-gray-400 to-gray-600",
      bgColor: "bg-gray-900/20",
      borderColor: "border-gray-500/30",
    },
    {
      title: "IPC Prediction",
      description: "AI-powered system suggests relevant Indian Penal Code sections based on case descriptions.",
      icon: <FileText className="h-8 w-8" />,
      color: "from-gray-400 to-gray-600",
      bgColor: "bg-gray-900/20",
      borderColor: "border-gray-500/30",
    },
    {
      title: "Speech to Text",
      description: "Convert verbal reports and testimonies into accurate text documents instantly.",
      icon: <Mic className="h-8 w-8" />,
      color: "from-gray-400 to-gray-600",
      bgColor: "bg-gray-900/20",
      borderColor: "border-gray-500/30",
    },
    {
      title: "Secure Communication",
      description: "End-to-end encrypted channels for sensitive information exchange between officers.",
      icon: <Shield className="h-8 w-8" />,
      color: "from-gray-400 to-gray-600",
      bgColor: "bg-gray-900/20",
      borderColor: "border-gray-500/30",
    },
  ]

  // Languages for demonstration
  const languages = ["English", "हिन्दी", "বাংলা", "తెలుగు", "मराठी", "தமிழ்", "ગુજરાતી", "ಕನ್ನಡ"]

  // Stats data
  const stats = [
    { value: "200+", label: "Police Departments", color: "from-gray-400 to-gray-600" },
    { value: "50+", label: "Languages Supported", color: "from-gray-400 to-gray-600" },
    { value: "95%", label: "Accuracy Rate", color: "from-gray-400 to-gray-600" },
    { value: "60%", label: "Time Saved", color: "from-gray-400 to-gray-600" },
  ]

  // Check which section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.5 },
    )

    const sections = [
      { ref: heroRef, id: "hero" },
      { ref: featuresRef, id: "features" },
      { ref: languageRef, id: "language" },
      { ref: ipcRef, id: "ipc" },
      { ref: speechRef, id: "speech" },
      { ref: testimonialsRef, id: "testimonials" },
      { ref: ctaRef, id: "cta" },
    ]

    sections.forEach(({ ref, id }) => {
      if (ref.current) {
        observer.observe(ref.current)
      }
    })

    return () => {
      sections.forEach(({ ref }) => {
        if (ref.current) {
          observer.unobserve(ref.current)
        }
      })
    }
  }, [])

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 100,
        delay: i * 0.1,
      },
    }),
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.05, color: "#a3a3a3" },
  }

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0, y: -20 },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -20,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
  }

  // Generate random blob shapes
  const generateBlobPath = () => {
    const radius = 40
    const points = []
    const numPoints = 8

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2
      const variance = Math.random() * 20 - 10
      const r = radius + variance
      const x = Math.cos(angle) * r
      const y = Math.sin(angle) * r
      points.push({ x, y })
    }

    let path = `M ${points[0].x},${points[0].y}`

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i]
      const p2 = points[(i + 1) % points.length]
      const cx = (p1.x + p2.x) / 2
      const cy = (p1.y + p2.y) / 2
      path += ` Q ${p1.x},${p1.y} ${cx},${cy}`
    }

    path += " Z"
    return path
  }

  const blobs = Array.from({ length: 5 }).map(() => generateBlobPath())

  return (
    <div className="relative min-h-screen bg-black text-gray-100 overflow-hidden">
      {/* Grid lines background */}
      <div className="fixed inset-0 z-0 opacity-25 pointer-events-none">
        {/* Horizontal lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`h-${i}`} className="absolute w-full h-px bg-gray-600" style={{ top: `${(i + 1) * 5}vh` }} />
        ))}

        {/* Vertical lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`v-${i}`} className="absolute h-full w-px bg-gray-600" style={{ left: `${(i + 1) * 5}vw` }} />
        ))}
      </div>
      {/* Animated background elements */}
      <div className="fixed inset-0 z-[-1] opacity-30">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/30 via-black to-black"></div>

        {/* Animated squares */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-20"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(${Math.random() * 360}deg, 
          #a3a3a3, 
          #525252)`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}

        {/* Animated wave */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-64 opacity-10"
          style={{
            background: "linear-gradient(to top, rgba(163, 163, 163, 0.2), transparent)",
            maskImage: "linear-gradient(to top, black, transparent)",
          }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Interactive cursor effect */}
      {isHovering && (
        <motion.div
          className="fixed w-20 h-20 rounded-full bg-gray-500/20 pointer-events-none z-50 blur-xl"
          style={{
            left: cursorPosition.x - 40,
            top: cursorPosition.y - 40,
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      )}

      {/* Navigation */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gray-800/50"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${Math.min(0.8, scrollY / 500)})`,
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Shield className="h-8 w-8 text-gray-400" />
            <span className="font-bold text-xl bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
              Lawsight
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            className="hidden md:flex items-center gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              { href: "#hero", label: "Home" },
              { href: "#features", label: "Features" },
              { href: "#language", label: "Languages" },
              { href: "#ipc", label: "IPC Prediction" },
              { href: "#testimonials", label: "Testimonials" },
            ].map((item, index) => (
              <motion.div key={item.href} variants={navItemVariants} whileHover="hover" custom={index}>
                <Link
                  href={item.href}
                  className={`relative hover:text-gray-400 transition-colors ${
                    activeSection === item.href.replace("#", "") ? "font-bold text-gray-300" : ""
                  }`}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  {item.label}
                  {activeSection === item.href.replace("#", "") && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gray-500"
                      layoutId="activeSection"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
            {isLoggedIn ? (
  <div className="relative">
    <motion.div
      variants={navItemVariants}
      whileHover={{ scale: 1.05 }}
      custom={6}
      onClick={() => setShowDropdown(!showDropdown)} // Toggle dropdown
    >
      <MotionButton
        variant="outline"
        className="border-gray-700 hover:text-black text-gray-500 rounded-full relative overflow-hidden"
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <span className="relative z-10">{username}</span> {/* Show logged-in user's email */}
        <motion.div
          className="absolute inset-0 bg-gray-800/50"
          initial={{ y: "100%" }}
          whileHover={{ y: 0 }}
          transition={{ duration: 0.4 }}
        />
      </MotionButton>
    </motion.div>

    {/* Dropdown Menu */}
    {showDropdown && (
      <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
        <div className="p-2 text-sm text-gray-300">Signed in as <br /> <span className="font-bold">{username}</span></div>
        <hr className="border-gray-700" />
        <button
          onClick={() => {
            localStorage.removeItem("user"); // Clear stored user data
            setIsLoggedIn(false);
            setShowDropdown(false);
            window.location.reload(); // Refresh to reset state
          }}
          className="w-full text-left p-2 hover:bg-gray-800 text-red-400 rounded-b-lg"
        >
          Logout
        </button>
      </div>
    )}
  </div>
) : (
  <motion.div variants={navItemVariants} whileHover={{ scale: 1.05 }} custom={6}>
    <MotionButton
      variant="outline"
      className="border-gray-700 hover:text-black text-white rounded-full relative overflow-hidden"
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => router.push("/loginSignup")} // Redirect to login page
    >
      <span className="relative z-10">Sign In</span>
      <motion.div
        className="absolute inset-0 bg-gray-800/50"
        initial={{ y: "100%" }}
        whileHover={{ y: 0 }}
        transition={{ duration: 0.4 }}
      />
    </MotionButton>
  </motion.div>
)}


            
          </motion.nav>

          {/* Mobile Menu Button */}
          <MotionButton
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(163, 163, 163, 0.1)" }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </MotionButton>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden bg-black/95 backdrop-blur-md border-b border-gray-800/50"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                {[
                  { href: "#hero", label: "Home" },
                  { href: "#features", label: "Features" },
                  { href: "#language", label: "Languages" },
                  { href: "#ipc", label: "IPC Prediction" },
                  { href: "#testimonials", label: "Testimonials" },
                ].map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`block py-2 px-4 rounded-lg ${
                        activeSection === item.href.replace("#", "")
                          ? "font-bold text-gray-300 bg-gray-800/20"
                          : "hover:bg-gray-800/10 hover:text-gray-300"
                      } transition-all`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  {isLoggedIn ? (
                    <MotionButton
                      variant="outline"
                      className="w-full border-gray-700 hover:text-white text-gray-500 mt-2 rounded-full relative overflow-hidden"
                      onClick={() => {
                        setIsMenuOpen(false)
                        setIsLoggedIn(false) // Logout functionality
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10">Logout ({username})</span>
                      <motion.div
                        className="absolute inset-0 bg-gray-800/50"
                        initial={{ y: "100%" }}
                        whileHover={{ y: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    </MotionButton>
                  ) : (
                    <MotionButton
                      variant="outline"
                      className="w-full border-gray-700 hover:text-white text-gray-500 mt-2 rounded-full relative overflow-hidden"
                      onClick={() => {
                        setIsMenuOpen(false)
                        // Simulate login
                        setIsLoggedIn(true)
                        setUsername("Officer")
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10">Sign In</span>
                      <motion.div
                        className="absolute inset-0 bg-gray-800/50"
                        initial={{ y: "100%" }}
                        whileHover={{ y: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    </MotionButton>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section
        id="hero"
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden z-10"
      >
        <motion.div className="absolute inset-0 z-0" style={{ y: heroParallax }}>
          {/* Grayscale shapes */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-gray-500/20 to-gray-700/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-gray-600/20 to-gray-800/20 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -10, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute top-1/2 right-1/3 w-72 h-72 bg-gradient-to-r from-gray-400/20 to-gray-600/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 15, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Spotlight effect container */}
        <div
          ref={spotlightRef}
          className="absolute inset-0 overflow-hidden"
          style={{
            maskImage: "radial-gradient(circle at 50% 30%, black, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 30%, black, transparent 70%)",
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-gray-500/30 via-gray-700/20 to-transparent"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          />
        </div>

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[70vh]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white relative">
                <span className="relative inline-block">
                  Next-Generation
                  <motion.span
                    className="absolute -inset-1 rounded-lg opacity-20 bg-gradient-to-r from-gray-600 to-gray-800 blur-xl"
                    animate={{
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                  />
                </span>{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-white to-gray-400">
                  Police Assistant
                </span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
            >
              <motion.p className="text-xl md:text-2xl mb-8 text-gray-300">
                Empowering law enforcement with{" "}
                <motion.span
                  className="relative text-white font-semibold"
                  animate={{
                    opacity: [0.4, 1, 1, 0.4], // Smooth fade in and out
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 1,
                    times: [0, 0.1, 0.9, 1],
                  }}
                >
                  AI-driven tools
                </motion.span>{" "}
                for efficient and accurate policing
              </motion.p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <MotionButton
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-gray-700 hover:text-black text-white-500 relative overflow-hidden rounded-full backdrop-blur-sm"
                  onClick={() => {
                    // Simulate login - in a real app, this would be after authentication
                    router.push("/justipc")
                  }}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <span className="relative z-10" >Try LawSight</span>
                  <motion.div
                    className="absolute inset-0 bg-gray-800/50"
                    initial={{ y: "100%" }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </MotionButton>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 20,
            }}
            className="mt-16 relative"
          >
            <motion.div
              className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gray-800/50 shadow-2xl"
              whileInView={{
                y: [0, -10, 0],
                transition: {
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
              }}
            >
              <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 aspect-video flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-gray-900/20"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <Image
                    src="./pages/public/police.jpg?height=600&width=1000"
                    alt="Police Assistant Dashboard"
                    width={1000}
                    height={600}
                    className="object-cover rounded-lg shadow-lg relative z-10"
                  />
                </motion.div>

                {/* Animated glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gray-500/10 via-transparent to-gray-500/10"
                  animate={{
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                />
              </div>
            </motion.div>

            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <motion.div
                animate={{
                  y: [0, 10, 0],
                  transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                }}
              >
                <Link href="#features">
                  <MotionButton
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-gray-900/80 backdrop-blur-sm shadow-lg hover:bg-gray-800/50 text-gray-400"
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(163, 163, 163, 0.3)",
                      boxShadow: "0 0 20px rgba(163, 163, 163, 0.5)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    <ChevronDown className="h-6 w-6" />
                  </MotionButton>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20 bg-black border-t border-gray-900 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our comprehensive suite of tools designed specifically for law enforcement professionals
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={feature.title} variants={fadeInUp} custom={index}>
                <motion.div
                  whileHover={{
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(163, 163, 163, 0.2), 0 8px 10px -6px rgba(163, 163, 163, 0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card
                    className={`h-full border-gray-800 ${feature.bgColor} hover:border-${feature.borderColor} transition-all duration-300 relative overflow-hidden rounded-xl backdrop-blur-sm`}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <motion.div
                        className={`mb-4 p-3 rounded-full bg-gradient-to-br ${feature.color}`}
                        whileHover={{
                          scale: 1.1,
                          rotate: 5,
                        }}
                      >
                        {feature.icon}
                      </motion.div>
                      <h3
                        className={`text-xl font-bold mb-2 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}
                      >
                        {feature.title}
                      </h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </CardContent>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
                      animate={{
                        x: ["100%", "-100%"],
                        transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: index + 3 },
                      }}
                    />
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center"
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(163, 163, 163, 0.2)",
                  borderColor: "rgba(163, 163, 163, 0.3)",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: index * 0.1 + 0.2,
                  }}
                  viewport={{ once: true }}
                >
                  <h3
                    className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
                  >
                    {stat.value}
                  </h3>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Multilanguage Support Section */}
      <section id="language" ref={languageRef} className="py-20 bg-black border-t border-gray-900 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
                Multilanguage Support
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Break language barriers with our advanced translation system that supports over 50 languages, enabling
                effective communication with all citizens.
              </p>

              <motion.div
                className="flex flex-wrap gap-3"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {languages.map((language, index) => (
                  <motion.div
                    key={language}
                    variants={fadeInUp}
                    custom={index}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(163, 163, 163, 0.3)",
                      boxShadow: "0 5px 15px rgba(163, 163, 163, 0.3)",
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-full text-sm font-medium text-gray-300 cursor-pointer transition-all duration-300"
                  >
                    {language}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <motion.div
                className="relative rounded-xl overflow-hidden border border-gray-800 shadow-xl"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 20px 25px -5px rgba(163, 163, 163, 0.2), 0 8px 10px -6px rgba(163, 163, 163, 0.2)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-gray-700/20 z-10"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                />
                <Image
                  src="/p4.jpg?height=400&width=600"
                  alt="Multilanguage Interface"
                  width={600}
                  height={400}
                  className="object-cover relative z-0"
                />

                {/* Animated highlight effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-gray-500/20 to-transparent"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* IPC Prediction Section */}
      <section id="ipc" ref={ipcRef} className="py-20 bg-black border-t border-gray-900 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
                IPC Prediction
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Our AI-powered system analyzes case descriptions and suggests relevant Indian Penal Code sections,
                improving accuracy and saving valuable time.
              </p>

              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  {
                    title: "Case Description Analysis",
                    description: "Natural language processing extracts key details from verbal or written descriptions",
                    color: "text-gray-300",
                    bgColor: "bg-gray-800/20",
                    borderColor: "border-gray-500/30",
                  },
                  {
                    title: "Section Matching",
                    description: "Matches case elements with appropriate IPC sections with 95% accuracy",
                    color: "text-gray-300",
                    bgColor: "bg-gray-800/20",
                    borderColor: "border-gray-500/30",
                  },
                  {
                    title: "Precedent Analysis",
                    description: "References similar past cases to improve prediction accuracy",
                    color: "text-gray-300",
                    bgColor: "bg-gray-800/20",
                    borderColor: "border-gray-500/30",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    variants={fadeInUp}
                    custom={index}
                    whileHover={{
                      scale: 1.03,
                      x: 5,
                      boxShadow: "0 10px 25px -5px rgba(163, 163, 163, 0.2)",
                    }}
                    className={`p-4 ${item.bgColor} rounded-xl ${item.borderColor} transition-all duration-300`}
                  >
                    <h4 className={`font-bold mb-2 ${item.color} flex items-center gap-2`}>
                      <Check className="h-5 w-5" />
                      {item.title}
                    </h4>
                    <p className="text-gray-400">{item.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <motion.div
                className="relative rounded-xl overflow-hidden border border-gray-800 shadow-xl"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 20px 25px -5px rgba(163, 163, 163, 0.2), 0 8px 10px -6px rgba(163, 163, 163, 0.2)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gray-700/20 to-gray-800/20 z-10"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                />
                <Image
                  src="/p2.jpg?height=400&width=600"
                  alt="IPC Prediction Interface"
                  width={600}
                  height={400}
                  className="object-cover relative z-0"
                />

                {/* Animated highlight effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-bl from-transparent via-gray-500/20 to-transparent"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" ref={testimonialsRef} className="py-20 bg-black border-t border-gray-900 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
              Trusted by Law Enforcement
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Hear from police departments that have transformed their operations with our assistant
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={testimonial.name} variants={fadeInUp} custom={index}>
                <motion.div
                  whileHover={{
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(163, 163, 163, 0.2), 0 8px 10px -6px rgba(163, 163, 163, 0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="h-full border-gray-800 bg-gray-900/50 hover:border-gray-700/50 transition-all duration-300 relative overflow-hidden rounded-xl backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <Image
                            src={testimonial.image || "/placeholder.svg"}
                            alt={testimonial.name}
                            width={60}
                            height={60}
                            className="rounded-full object-cover border-2 border-gray-500/50"
                          />
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-gray-300">{testimonial.name}</h3>
                          <p className="text-gray-400">{testimonial.role}</p>
                          <div className="flex mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < testimonial.rating ? "text-gray-400" : "text-gray-600"}`}
                                fill={i < testimonial.rating ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 italic">"{testimonial.content}"</p>
                    </CardContent>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
                      animate={{
                        x: ["100%", "-100%"],
                        transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: index + 4 },
                      }}
                    />
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <motion.div
              className="inline-flex items-center gap-1 text-gray-400 bg-gray-900/50 px-4 py-2 rounded-full"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(163, 163, 163, 0.2)",
              }}
            >
              <Users className="h-5 w-5 text-gray-400" />
              <span>Trusted by 200+ police departments across the country</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" ref={ctaRef} className="py-20 bg-black border-t border-gray-900 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center relative overflow-hidden"
          >
            <div className="p-10 rounded-2xl relative z-10">
              {/* Blob shapes background */}
              <div className="absolute inset-0 -z-10">
                {blobs.map((path, index) => (
                  <motion.svg
                    key={index}
                    viewBox="-50 -50 100 100"
                    className="absolute w-full h-full"
                    style={{
                      top: `${index * 10}%`,
                      left: `${index * 15}%`,
                      opacity: 0.2,
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, 0],
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                      duration: 8 + index,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <motion.path d={path} fill={`url(#gradient-${index})`} />
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#525252" />
                        <stop offset="100%" stopColor="#171717" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                ))}
              </div>

              <div className="absolute inset-0 backdrop-blur-sm bg-gray-900/50 rounded-2xl border border-gray-800"></div>

              <motion.h2
                className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Ready to Transform Your Department?
              </motion.h2>
              <motion.p
                className="text-xl mb-8 text-gray-300 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Join hundreds of police departments nationwide that have improved efficiency, accuracy, and service with
                our AI assistant.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              ></motion.div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
                animate={{
                  x: ["100%", "-100%"],
                  transition: { duration: 3, repeat: Number.POSITIVE_INFINITY, repeatDelay: 5 },
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-gray-900 z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-gray-400" />
                <span className="font-bold text-lg bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
                  Lawsight
                </span>
              </div>
              <p className="text-gray-400 mb-4">Empowering law enforcement with next-generation AI tools.</p>
            </motion.div>

            {[
              {
                title: "Features",
                links: [
                  { name: "Multilanguage Support", href: "#language" },
                  { name: "IPC Prediction", href: "#ipc" },
                  { name: "Speech to Text", href: "#speech" },
                  { name: "Secure Communication", href: "#" },
                ],
              },
              {
                title: "Resources",
                links: [
                  { name: "Documentation", href: "#" },
                  { name: "Training", href: "#" },
                  { name: "Case Studies", href: "#" },
                ],
              },
              {
                title: "Company",
                links: [
                  { name: "About Us", href: "#" },
                  { name: "Careers", href: "#" },
                  { name: "Contact", href: "#" },
                  { name: "Privacy Policy", href: "#" },
                ],
              },
            ].map((column, columnIndex) => (
              <motion.div
                key={column.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: columnIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
                  {column.title}
                </h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <motion.li
                      key={link.name}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <MotionLink
                        href={link.href}
                        className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
                        whileHover={{ color: "#d4d4d4" }}
                      >
                        {link.name}
                      </MotionLink>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 pt-8 border-t border-gray-800 text-center"
          >
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Lawsight. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}

