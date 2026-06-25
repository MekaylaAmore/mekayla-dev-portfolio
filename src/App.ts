import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Github, Linkedin, Mail, ExternalLink, Code2, Database, Server,
  Cpu, GitBranch, Container, ChevronRight, Send, Sparkles, Zap,
  Layers, Globe, GraduationCap, Briefcase, Award, Star, MessageSquare,
  TrendingUp, Users, Loader2, FileText, BookOpen, Download, Shield, CheckCircle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Review {
  id: string;
  name: string;
  rating: number;
  role: string | null;
  message: string;
  created_at: string;
}

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(
        target.tagName === 'BUTTON' || target.tagName === 'A' ||
        !!target.closest('button') || !!target.closest('a')
      );
    };
    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <div
        className="custom-cursor hidden lg:block"
        style={{ left: position.x - 10, top: position.y - 10, transform: isHovering ? 'scale(1.5)' : 'scale(1)' }}
      />
      <div
        className="custom-cursor-dot hidden lg:block"
        style={{ left: position.x - 2, top: position.y - 2 }}
      />
    </>
  );
};

const FloatingParticle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className="particle"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0 }}
    animate={{ opacity: [0.2, 0.8, 0.2], y: [-20, 20, -20], x: [-10, 10, -10] }}
    transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const AnimatedBackground = () => (
  <div className="animated-bg">
    {[...Array(20)].map((_, i) => (
      <FloatingParticle key={i} delay={i * 0.3} x={Math.random() * 100} y={Math.random() * 100} />
    ))}
  </div>
);

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['About', 'Skills', 'Projects', 'Experience', 'Credentials', 'Reviews', 'Contact'];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-panel py-4' : 'py-6'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <motion.div className="font-display text-xl tracking-wider" whileHover={{ scale: 1.05 }}>
          <span className="chrome-text font-bold">MKD</span>
          <span className="text-pink-neon/50">.</span>
        </motion.div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="relative text-sm text-gray-400 hover:text-pink-neon transition-colors group"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-pink-neon group-hover:w-full transition-all duration-300" />
            </motion.a>
          ))}
        </div>

        <motion.a
          href="mailto:mekayladewee0@gmail.com"
          className="glow-button px-6 py-2 rounded-full text-sm font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Hire Me
        </motion.a>
      </div>
    </motion.nav>
  );
};

const HeroSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const orbitItems = ['React', 'TypeScript', 'Spring Boot', 'Java', 'MySQL', 'Docker', 'Node.js', 'Git', 'REST API', 'CSS3', 'Python', 'Figma'];

  return (
    <motion.section
      ref={containerRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-6"
      style={{ opacity, scale, y }}
    >
      {/* Orbiting rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[150, 220, 300].map((radius, ring) => (
          <motion.div
            key={radius}
            className="orbit absolute"
            style={{ width: radius * 2, height: radius * 2, border: `1px solid rgba(255, 20, 147, ${0.12 - ring * 0.03})` }}
            animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 30 + ring * 12, repeat: Infinity, ease: 'linear' }}
          >
            {orbitItems.slice(ring * 4, ring * 4 + 4).map((item, i) => (
              <motion.div
                key={item}
                className="absolute text-xs text-pink-neon/50 font-mono whitespace-nowrap bg-black/40 px-2 py-0.5 rounded"
                style={{
                  top: '50%', left: '50%',
                  transform: `rotate(${i * 90 + ring * 45}deg) translateX(${radius}px) rotate(-${i * 90 + ring * 45}deg) translate(-50%, -50%)`,
                }}
              >
                {item}
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center max-w-4xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="mb-4">
          <span className="font-mono text-pink-neon/60 text-sm tracking-[0.3em] uppercase">
            Junior Software Developer · Johannesburg, South Africa
          </span>
        </motion.div>

        <motion.h1
          className="font-display text-5xl md:text-8xl font-bold mb-6 glitch"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          data-text="MEKAYLA DEWEE"
        >
          <span className="chrome-text">MEKAYLA DEWEE</span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          I build systems that{' '}
          <span className="text-pink-neon neon-text">look like art</span> and{' '}
          <span className="text-grid-purple">behave like engineering</span>.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.a
            href="#projects"
            className="glow-button px-8 py-4 rounded-full font-display text-lg flex items-center justify-center gap-2 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            Enter My World
          </motion.a>
          <motion.a
            href="#about"
            className="px-8 py-4 rounded-full font-display text-lg border border-pink-neon/30 hover:border-pink-neon hover:bg-pink-neon/10 transition-all duration-300 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Work
            <ChevronRight className="w-5 h-5" />
          </motion.a>
        </motion.div>

        {/* Social quick links */}
        <motion.div
          className="flex justify-center gap-6 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[
            { href: 'https://github.com/MekaylaAmore', icon: Github, label: 'GitHub' },
            { href: 'https://linkedin.com/in/mekayla-de-wee', icon: Linkedin, label: 'LinkedIn' },
            { href: 'mailto:mekayladewee0@gmail.com', icon: Mail, label: 'Email' },
          ].map(({ href, icon: Icon, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500 hover:text-pink-neon transition-colors text-sm"
              whileHover={{ scale: 1.1, y: -2 }}
            >
              <Icon className="w-4 h-4" />
              <span className="font-mono hidden sm:inline">{label}</span>
            </motion.a>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border border-pink-neon/30 flex items-start justify-center p-2">
            <motion.div className="w-1 h-2 bg-pink-neon rounded-full" animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeTimeline, setActiveTimeline] = useState(0);

  const timeline = [
    {
      year: '2019',
      title: 'Matric — Hoërskool Die Adelaar',
      description: 'Completed National Senior Certificate. The spark of curiosity for technology was already burning.',
      icon: GraduationCap,
    },
    {
      year: '2022 – 2024',
      title: 'Diploma in IT — Rosebank College',
      description: 'Graduated with Distinction (NQF Level 6) in Software Development. Mastered full-stack web development foundations.',
      icon: Award,
    },
    {
      year: '2025 – 2026',
      title: 'IT Intern — Cape Wealth Managers',
      description: 'Yes4Youth Learnership. Built internal business apps, debugged production systems, and thrived in Agile sprint cycles.',
      icon: Code2,
    },
    {
      year: '2026 – Now',
      title: 'Software Developer — Cape Wealth Managers',
      description: 'Promoted to full developer. Resolving bugs, shipping features, managing CI/CD workflows, and contributing at scale.',
      icon: Zap,
    },
  ];

  return (
    <section id="about" className="min-h-screen py-32 px-6 relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-pink-neon/60 text-sm tracking-[0.3em] uppercase mb-4 block">Origin Story</span>
          <h2 className="font-display text-4xl md:text-6xl font-bold">
            <span className="glitch" data-text="WHO I AM">WHO I AM</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Profile Dossier Card */}
          <motion.div
            className="glass-panel rounded-2xl p-8 relative overflow-hidden"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="scan-line absolute inset-0 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-neon to-grid-purple flex items-center justify-center neon-border flex-shrink-0">
                <span className="font-display text-xl font-bold">MD</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl font-bold">Mekayla DeWee</h3>
                <p className="text-pink-neon/60 text-sm">Junior Software Developer</p>
                <p className="text-gray-500 text-xs mt-0.5">Johannesburg, South Africa</p>
              </div>
              <span className="tag-chip text-xs flex-shrink-0">AVAILABLE</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Experience', value: '2+', sub: 'years' },
                { label: 'Education', value: 'NQF 6', sub: 'Distinction' },
                { label: 'Skills', value: '20+', sub: 'technologies' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-3 rounded-lg bg-black/30 border border-pink-neon/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="font-display text-lg font-bold text-pink-neon leading-tight">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.sub}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Bio / Summary */}
            <p className="text-gray-400 leading-relaxed text-sm">
              Junior Software Developer with a Diploma in Software Development and hands-on experience
              building full-stack web applications using Java, Spring Boot, JavaScript, React, SQL, and
              REST APIs. Passionate about developing scalable software solutions, writing clean code,
              and collaborating in Agile teams.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-4 h-4 text-pink-neon" />
                <span>mekayladewee0@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Github className="w-4 h-4 text-pink-neon" />
                <span>github.com/MekaylaAmore</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Linkedin className="w-4 h-4 text-pink-neon" />
                <span>linkedin.com/in/mekayla-de-wee</span>
              </div>
            </div>

            {/* Core Tech Tags */}
            <div className="flex flex-wrap gap-2 mt-6">
              {['Java', 'React', 'Spring Boot', 'TypeScript', 'Node.js', 'SQL'].map((tech) => (
                <span key={tech} className="tag-chip text-xs">{tech}</span>
              ))}
            </div>
          </motion.div>

          {/* Journey Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="font-display text-xl mb-8 flex items-center gap-2">
              <Zap className="w-5 h-5 text-pink-neon" />
              Journey Timeline
            </h3>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-pink-neon via-grid-purple to-transparent" />

              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  className="relative pl-12 pb-8 cursor-pointer"
                  onClick={() => setActiveTimeline(i)}
                  onMouseEnter={() => setActiveTimeline(i)}
                  initial={{ opacity: 0, x: 30 }}
                  animate={isInView ? { opacity: i === activeTimeline ? 1 : 0.45, x: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <motion.div
                    className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      i === activeTimeline ? 'bg-pink-neon/20 neon-border' : 'bg-black/50 border border-pink-neon/20'
                    }`}
                    animate={{ scale: i === activeTimeline ? 1.2 : 1 }}
                  >
                    <item.icon className={`w-4 h-4 ${i === activeTimeline ? 'text-pink-neon' : 'text-gray-500'}`} />
                  </motion.div>

                  <div className="glass-panel rounded-lg p-4">
                    <span className="font-mono text-xs text-pink-neon">{item.year}</span>
                    <h4 className="font-display font-bold mt-1 text-sm">{item.title}</h4>
                    <p className="text-sm text-gray-400 mt-2 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SkillsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeCategory, setActiveCategory] = useState('all');

  const skillCategories = [
    { id: 'all', label: 'All Skills', icon: Globe },
    { id: 'frontend', label: 'Frontend', icon: Code2 },
    { id: 'backend', label: 'Backend', icon: Server },
    { id: 'database', label: 'Databases', icon: Database },
    { id: 'tools', label: 'Tools', icon: Cpu },
  ];

  const skills = [
    { name: 'React', level: 88, category: 'frontend', color: '#61DAFB' },
    { name: 'JavaScript', level: 90, category: 'frontend', color: '#F7DF1E' },
    { name: 'TypeScript', level: 82, category: 'frontend', color: '#3178C6' },
    { name: 'HTML5', level: 95, category: 'frontend', color: '#E34F26' },
    { name: 'CSS3', level: 90, category: 'frontend', color: '#1572B6' },
    { name: 'Bootstrap', level: 85, category: 'frontend', color: '#7952B3' },
    { name: 'Java', level: 85, category: 'backend', color: '#ED8B00' },
    { name: 'Spring Boot', level: 80, category: 'backend', color: '#6DB33F' },
    { name: 'Node.js', level: 78, category: 'backend', color: '#339933' },
    { name: 'REST APIs', level: 88, category: 'backend', color: '#00D4FF' },
    { name: 'Python', level: 72, category: 'backend', color: '#3776AB' },
    { name: 'MySQL', level: 88, category: 'database', color: '#4479A1' },
    { name: 'PostgreSQL', level: 82, category: 'database', color: '#4169E1' },
    { name: 'MS SQL Server', level: 78, category: 'database', color: '#CC2927' },
    { name: 'Oracle DB', level: 70, category: 'database', color: '#F80000' },
    { name: 'Git', level: 90, category: 'tools', color: '#F05032' },
    { name: 'Docker', level: 72, category: 'tools', color: '#2496ED' },
    { name: 'Jira', level: 85, category: 'tools', color: '#0052CC' },
    { name: 'Postman', level: 88, category: 'tools', color: '#FF6C37' },
    { name: 'Figma', level: 75, category: 'tools', color: '#F24E1E' },
    { name: 'Maven', level: 76, category: 'tools', color: '#C71A36' },
    { name: 'VSCode', level: 92, category: 'tools', color: '#007ACC' },
  ];

  const filteredSkills = activeCategory === 'all' ? skills : skills.filter((s) => s.category === activeCategory);

  return (
    <section id="skills" className="min-h-screen py-32 px-6 relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-pink-neon/60 text-sm tracking-[0.3em] uppercase mb-4 block">Tech Energy Grid</span>
          <h2 className="font-display text-4xl md:text-6xl font-bold">
            <span className="glitch" data-text="POWER SYSTEMS">POWER SYSTEMS</span>
          </h2>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          {skillCategories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-all ${
                activeCategory === cat.id ? 'glow-button neon-border' : 'border border-pink-neon/20 hover:border-pink-neon/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </motion.button>
          ))}
        </motion.div>

        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" layout>
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill, i) => (
              <motion.div
                key={skill.name}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="relative group"
              >
                <div className="glass-panel rounded-xl p-5 text-center hover:neon-border transition-all duration-300 relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle at center, ${skill.color}15, transparent)` }}
                  />
                  <motion.div className="energy-node mx-auto mb-3" whileHover={{ scale: 1.1 }}>
                    <span className="font-display text-base font-bold" style={{ color: skill.color }}>
                      {skill.name.slice(0, 2).toUpperCase()}
                    </span>
                  </motion.div>
                  <h3 className="font-display font-bold text-sm mb-3">{skill.name}</h3>
                  <div className="progress-glow">
                    <motion.div
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${skill.color}, var(--pink-neon))` }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${skill.level}%` } : {}}
                      transition={{ duration: 1, delay: 0.5 + i * 0.08 }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 mt-2 block">{skill.level}%</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Methodologies row */}
        <motion.div
          className="mt-12 glass-panel rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
        >
          <h3 className="font-display text-sm text-pink-neon/60 mb-4 uppercase tracking-wider">Methodologies & Practices</h3>
          <div className="flex flex-wrap gap-3">
            {['Agile', 'Scrum', 'OOP', 'CI/CD Concepts', 'Test-Driven Development', 'AWS Fundamentals', 'UI/UX Principles', 'Responsive Design'].map((m) => (
              <span key={m} className="tag-chip">{m}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const ALL_PROJECTS = [
  {
    id: 'finance',
    title: 'Finance Tracker App',
    description: 'Comprehensive personal finance management with real-time analytics, budget tracking, and data visualisation dashboards.',
    image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['React', 'Node.js', 'MySQL', 'Chart.js'],
    category: 'FinTech',
    color: '#00D4FF',
    github: 'https://github.com/MekaylaAmore',
  },
  {
    id: 'club',
    title: 'Football Club Management',
    description: 'Full admin system for sports clubs — player rosters, match scheduling, performance analytics, and season reports.',
    image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Java', 'Spring Boot', 'MySQL', 'Thymeleaf'],
    category: 'Enterprise',
    color: '#00FF88',
    github: 'https://github.com/MekaylaAmore',
  },
  {
    id: 'wallet',
    title: 'Digital Wallet API',
    description: 'Secure fintech backend API with transaction processing, JWT authentication, multi-currency support, and audit logging.',
    image: 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Spring Boot', 'Java', 'PostgreSQL', 'REST API'],
    category: 'FinTech',
    color: '#A855F7',
    github: 'https://github.com/MekaylaAmore',
  },
  {
    id: 'task',
    title: 'Task Management System',
    description: 'SaaS-style project management with Kanban boards, team collaboration, sprint tracking, and real-time updates.',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    category: 'SaaS',
    color: '#FF6B35',
    github: 'https://github.com/MekaylaAmore',
  },
  {
    id: 'attendance',
    title: 'Attendance Tracker',
    description: 'System to track and manage student or employee attendance with real-time reporting and absence notifications.',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Java', 'Spring Boot', 'MySQL', 'REST API'],
    category: 'Enterprise',
    color: '#F7DF1E',
    github: 'https://github.com/MekaylaAmore/AttendanceTracker',
  },
  {
    id: 'resume',
    title: 'Resume Builder',
    description: 'Interactive resume builder with live preview, customisable templates, and one-click PDF export functionality.',
    image: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['React', 'TypeScript', 'CSS3', 'HTML5'],
    category: 'SaaS',
    color: '#FF1493',
    github: 'https://github.com/MekaylaAmore/ResumeBuilder',
  },
  {
    id: 'grep',
    title: 'CodeCrafters Grep — TS',
    description: 'Custom grep-like CLI tool built in TypeScript as part of the CodeCrafters challenge — implementing pattern matching from scratch.',
    image: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['TypeScript', 'Node.js', 'CLI', 'Algorithms'],
    category: 'Dev Tools',
    color: '#3178C6',
    github: 'https://github.com/MekaylaAmore/codecrafters-grep-typescript',
  },
  {
    id: 'quiz',
    title: 'QuizMaster',
    description: 'Interactive quiz application with multiple categories, dynamic scoring, leaderboards, and a timed challenge mode.',
    image: 'https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['React', 'JavaScript', 'CSS3', 'REST API'],
    category: 'Education',
    color: '#00FF88',
    github: 'https://github.com/MekaylaAmore/QuizMaster',
  },
  {
    id: 'module',
    title: 'Module Management System',
    description: 'Academic module management for course tracking, assignment submission, grade management, and progress reporting.',
    image: 'https://images.pexels.com/photos/4974912/pexels-photo-4974912.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Java', 'Spring Boot', 'MySQL', 'Thymeleaf'],
    category: 'Enterprise',
    color: '#00D4FF',
    github: 'https://github.com/MekaylaAmore/ModuleManagement',
  },
  {
    id: 'recipe',
    title: 'Mekayla Recipe App',
    description: 'Full-featured recipe discovery app with search, favourites, ingredient lists, and step-by-step cooking instructions.',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['React', 'JavaScript', 'CSS3', 'REST API'],
    category: 'Lifestyle',
    color: '#FF6B35',
    github: 'https://github.com/MekaylaAmore/MekaylaRecipeApp_Part3',
  },
  {
    id: 'practicum',
    title: 'Practicum Exam Project',
    description: 'Full-stack academic practicum demonstrating end-to-end development competency from requirements gathering through deployment.',
    image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Java', 'Spring Boot', 'MySQL', 'Bootstrap'],
    category: 'Academic',
    color: '#A855F7',
    github: 'https://github.com/MekaylaAmore/Practicum-Exam',
  },
  {
    id: 'robotics',
    title: 'Robotics For Kids',
    description: 'Engaging web application introducing robotics concepts to children with fun animations, quizzes, and interactive modules.',
    image: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Responsive'],
    category: 'Education',
    color: '#F7DF1E',
    github: 'https://github.com/MekaylaAmore/Robotics-For-Kids-Web-Application',
  },
  {
    id: 'chilli',
    title: "Nadine's Chilli",
    description: "Restaurant and recipe showcase website for Nadine's famous chilli brand — menu, brand story, and polished UI.",
    image: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['React', 'CSS3', 'JavaScript', 'Responsive'],
    category: 'Lifestyle',
    color: '#FF1493',
    github: 'https://github.com/MekaylaAmore/nadines-chilli',
  },
];

const PROJECT_FILTERS = ['All', 'FinTech', 'Enterprise', 'SaaS', 'Education', 'Dev Tools', 'Lifestyle', 'Academic'];

const ProjectsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const filtered = activeFilter === 'All'
    ? ALL_PROJECTS
    : ALL_PROJECTS.filter((p) => p.category === activeFilter);

  return (
    <section id="projects" className="py-32 px-6 relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <span className="font-mono text-pink-neon/60 text-sm tracking-[0.3em] uppercase mb-4 block">Showcase Vault</span>
          <h2 className="font-display text-4xl md:text-6xl font-bold">
            <span className="glitch" data-text="DIGITAL CREATIONS">DIGITAL CREATIONS</span>
          </h2>
          <p className="text-gray-500 mt-3 text-sm">{ALL_PROJECTS.length} projects — built with passion, shipped with precision.</p>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          {PROJECT_FILTERS.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                activeFilter === cat
                  ? 'glow-button neon-border'
                  : 'border border-pink-neon/20 hover:border-pink-neon/50 text-gray-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* Project grid */}
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="group"
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <motion.div
                  className="project-card glass-panel rounded-2xl overflow-hidden flex flex-col"
                  animate={{
                    rotateY: hoveredProject === project.id ? 1.5 : 0,
                    rotateX: hoveredProject === project.id ? -1.5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <span
                      className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-mono font-bold"
                      style={{ background: `${project.color}25`, border: `1px solid ${project.color}`, color: project.color }}
                    >
                      {project.category}
                    </span>
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(135deg, ${project.color}10, transparent)` }}
                    />
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display text-base font-bold mb-2 group-hover:text-pink-neon transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-3 flex-1 leading-relaxed">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tags.map((tag) => (
                        <span key={tag} className="tag-chip text-xs">{tag}</span>
                      ))}
                    </div>
                    <motion.a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-lg text-center text-xs font-medium border border-pink-neon/30 hover:border-pink-neon hover:bg-pink-neon/5 transition-colors flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Github className="w-3.5 h-3.5" />
                      View on GitHub
                    </motion.a>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* GitHub CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <motion.a
            href="https://github.com/MekaylaAmore"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 glass-panel px-8 py-4 rounded-full border border-pink-neon/20 hover:border-pink-neon/50 transition-all group"
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <Github className="w-5 h-5 text-pink-neon" />
            <span className="font-display text-sm">View All Repos on GitHub</span>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-pink-neon transition-colors" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

const ExperienceSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeCommand, setActiveCommand] = useState(0);

  const commands = [
    { cmd: 'whoami', result: 'mekayla@capewealthmanagers — Software Developer' },
    { cmd: 'cat workflow.txt', result: 'Agile · Scrum · Sprint Planning · Retrospectives · Daily Standups' },
    { cmd: 'git log --oneline --author="Mekayla"', result: 'feat: resolve module bugs | fix: improve app stability | chore: CI/CD update' },
    { cmd: 'ls tools/', result: 'Git  GitHub  Jira  Docker  Postman  Maven  VSCode  Figma' },
  ];

  const experiences = [
    {
      title: 'Software Developer',
      company: 'Cape Wealth Managers (Pty) Ltd',
      period: 'Feb 2026 – Present',
      type: 'CURRENT',
      color: '#00FF88',
      highlights: [
        'Identifying and resolving bugs across multiple modules, improving application stability and UX',
        'Participating in full Agile sprint cycles — stand-ups, planning, and retrospectives',
        'Managing source code via Git & GitHub, adhering to branching strategies and CI/CD workflows',
      ],
    },
    {
      title: 'IT Intern — Software Developer',
      company: 'Cape Wealth Managers (Pty) Ltd · Yes4Youth Learnership',
      period: 'Feb 2025 – Jan 2026',
      type: 'INTERN',
      color: '#A855F7',
      highlights: [
        'Contributed to frontend and backend development of internal business applications',
        'Assisted with debugging, testing, and improving system functionality across modules',
        'Worked within an Agile team environment, participating in stand-ups and sprint activities',
        'Gained hands-on experience with production systems, Git version control, and professional dev workflows',
      ],
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => setActiveCommand((prev) => (prev + 1) % commands.length), 3000);
    return () => clearInterval(interval);
  }, [commands.length]);

  return (
    <section id="experience" className="min-h-screen py-32 px-6 relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-pink-neon/60 text-sm tracking-[0.3em] uppercase mb-4 block">Simulation Mode</span>
          <h2 className="font-display text-4xl md:text-6xl font-bold">
            <span className="glitch" data-text="SYSTEM EXPERIENCE">SYSTEM EXPERIENCE</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Terminal */}
          <motion.div
            className="terminal rounded-2xl overflow-hidden"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-black/50 border-b border-pink-neon/20">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-gray-500 ml-2 font-mono">mekayla@dev:~/capewealthmanagers</span>
            </div>

            <div className="p-4 h-[350px] overflow-hidden">
              {commands.map((command, i) => (
                <motion.div
                  key={i}
                  className="mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: i <= activeCommand ? 1 : 0.25, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-mono text-sm">$</span>
                    <span className="font-mono text-sm text-pink-neon">{command.cmd}</span>
                  </div>
                  <motion.div
                    className="text-xs text-gray-400 font-mono mt-1 ml-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: i <= activeCommand ? 1 : 0 }}
                    transition={{ delay: i * 0.2 + 0.15 }}
                  >
                    {command.result}
                  </motion.div>
                </motion.div>
              ))}
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-mono text-sm">$</span>
                <span className="w-2 h-4 bg-pink-neon animate-pulse" />
              </div>
            </div>
          </motion.div>

          {/* Experience Cards + Education */}
          <div className="space-y-6">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.title}
                className="glass-panel rounded-xl p-6 relative overflow-hidden"
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              >
                <div className="scan-line absolute inset-0 pointer-events-none" />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-4 h-4 text-pink-neon flex-shrink-0" />
                      <h3 className="font-display font-bold text-base">{exp.title}</h3>
                    </div>
                    <p className="text-pink-neon/80 text-sm leading-snug">{exp.company}</p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-mono font-bold flex-shrink-0"
                    style={{ background: `${exp.color}20`, border: `1px solid ${exp.color}`, color: exp.color }}
                  >
                    {exp.type}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-4 font-mono">{exp.period}</p>

                <ul className="space-y-2">
                  {exp.highlights.map((highlight, j) => (
                    <motion.li
                      key={j}
                      className="flex items-start gap-2 text-sm text-gray-400"
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.4 + j * 0.08 }}
                    >
                      <ChevronRight className="w-4 h-4 text-pink-neon flex-shrink-0 mt-0.5" />
                      {highlight}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Education Card */}
            <motion.div
              className="glass-panel rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
            >
              <h4 className="font-display text-sm mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-pink-neon" />
                Education
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-bold text-white">Diploma in IT — Software Development</p>
                  <p className="text-xs text-pink-neon/70">Rosebank College, Braamfontein · Feb 2022 – Dec 2024</p>
                  <span className="text-xs bg-pink-neon/10 border border-pink-neon/30 text-pink-neon px-2 py-0.5 rounded-full mt-1 inline-block">NQF Level 6 · Distinction</span>
                </div>
                <div className="pt-2 border-t border-pink-neon/10">
                  <p className="text-sm font-bold text-white">National Senior Certificate (Matric)</p>
                  <p className="text-xs text-gray-500">Hoërskool Die Adelaar · 2019</p>
                </div>
              </div>
            </motion.div>

            {/* Commit Activity */}
            <motion.div
              className="glass-panel rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 }}
            >
              <h4 className="font-display text-sm mb-4 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-pink-neon" />
                Commit Activity
              </h4>
              <div className="flex items-end gap-1">
                {[...Array(52)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${8 + Math.random() * 24}px`,
                      background: Math.random() > 0.4
                        ? `rgba(255, 20, 147, ${0.3 + Math.random() * 0.7})`
                        : `rgba(168, 85, 247, ${0.2 + Math.random() * 0.5})`,
                    }}
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    transition={{ delay: i * 0.015, origin: 'bottom' }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Now</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Star Rating Widget ───────────────────────────────────────────────────────
const StarWidget = ({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          whileHover={onChange ? { scale: 1.2 } : {}}
          whileTap={onChange ? { scale: 0.9 } : {}}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            className={`${sz} transition-all duration-150 ${
              star <= (hovered || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
};

// ─── Documents Section ───────────────────────────────────────────────────────
const DocumentsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const documents = [
    {
      id: 'cv',
      title: 'Curriculum Vitae',
      subtitle: 'Mekayla DeWee — Junior Software Developer',
      description: 'Complete professional resume covering work experience at Cape Wealth Managers, full technical skills inventory, and academic background.',
      icon: FileText,
      color: '#FF1493',
      badge: 'RESUME',
      details: ['Software Developer · Feb 2026 – Present', 'IT Intern · Feb 2025 – Jan 2026', 'Full tech stack & skills', 'Johannesburg, South Africa'],
      downloadLabel: 'Download CV',
      href: '/documents/Mekayla_DeWee_Software_Developer_CV.pdf',
    },
    {
      id: 'diploma',
      title: 'Diploma Certificate',
      subtitle: 'The IIE — Rosebank College',
      description: 'Official Diploma in Information Technology: Software Development awarded by The Independent Institute of Education, achieved With Distinction.',
      icon: Award,
      color: '#A855F7',
      badge: 'QUALIFICATION',
      details: ['Diploma in IT: Software Development', 'NQF Level 6 — With Distinction', 'The IIE · Rosebank College, Braamfontein', 'Awarded: 31 December 2024'],
      downloadLabel: 'View Certificate',
      href: "/documents/Mekayla's_Qualification_Certificate.pdf",
    },
    {
      id: 'transcript',
      title: 'Academic Transcript',
      subtitle: 'Official Results — The IIE · ST10232005',
      description: 'Full unabridged academic transcript showing all 24 module results across 3 years. Total 360 NQF credits earned. Multiple Distinctions.',
      icon: BookOpen,
      color: '#00D4FF',
      badge: 'TRANSCRIPT',
      details: ['360 credits across 24 modules', 'Highlights: Advanced Databases 94%, Applied Programming 91%', 'Human Computer Interaction 92%', 'Issued: 17 December 2024'],
      downloadLabel: 'View Transcript',
      href: "/documents/Mekayla's_Full_academic_transcript.pdf",
    },
    {
      id: 'yes4youth',
      title: 'YES4Youth Certificate',
      subtitle: 'Youth Employment Service · Cape Wealth Managers',
      description: 'Certificate of Completion for the YES4Youth quality work experience programme, signed by Ravi Naidoo, CEO of the Youth Employment Service.',
      icon: Shield,
      color: '#00FF88',
      badge: 'INTERNSHIP',
      details: ['Youth Employment Service (YES)', 'Quality Work Experience Programme', 'Cape Wealth Managers (Pty) Ltd', 'Completed: 01 February 2026'],
      downloadLabel: 'View Certificate',
      href: '/documents/certificate_of_completion.pdf',
    },
  ];

  return (
    <section id="credentials" className="py-32 px-6 relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-pink-neon/60 text-sm tracking-[0.3em] uppercase mb-4 block">Verified Credentials</span>
          <h2 className="font-display text-4xl md:text-6xl font-bold">
            <span className="glitch" data-text="PROOF OF WORK">PROOF OF WORK</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-lg mx-auto text-sm">
            Authenticated qualifications, certificates, and official documents — all downloadable.
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 glass-panel px-6 py-3 rounded-full border border-green-500/30">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-400 font-mono">All documents are verified & authentic</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {documents.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
              className="group"
            >
              <div className="glass-panel rounded-2xl p-6 h-full flex flex-col hover:neon-border transition-all duration-300 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 20% 20%, ${doc.color}08, transparent)` }}
                />
                <div className="scan-line absolute inset-0 pointer-events-none opacity-40" />

                <div className="flex items-start justify-between mb-5">
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${doc.color}15`, border: `1px solid ${doc.color}40` }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <doc.icon className="w-6 h-6" style={{ color: doc.color }} />
                  </motion.div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-mono font-bold"
                    style={{ background: `${doc.color}15`, border: `1px solid ${doc.color}50`, color: doc.color }}
                  >
                    {doc.badge}
                  </span>
                </div>

                <h3 className="font-display text-base font-bold mb-1">{doc.title}</h3>
                <p className="text-pink-neon/60 text-xs mb-3 font-mono leading-snug">{doc.subtitle}</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-4 flex-1">{doc.description}</p>

                <ul className="space-y-1.5 mb-5">
                  {doc.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2 text-xs text-gray-500">
                      <div className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ background: doc.color }} />
                      {detail}
                    </li>
                  ))}
                </ul>

                <motion.a
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-display font-bold transition-all duration-300 group/btn"
                  style={{ background: `${doc.color}15`, border: `1px solid ${doc.color}40`, color: doc.color }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-3.5 h-3.5 group-hover/btn:animate-bounce" />
                  {doc.downloadLabel}
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-xs text-gray-600 mt-8 font-mono"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
        >
          Original documents available on request · mekayladewee0@gmail.com
        </motion.p>
      </div>
    </section>
  );
};

// ─── Review Card ─────────────────────────────────────────────────────────────
const ReviewCard = ({ review, index }: { review: Review; index: number }) => {
  const initials = review.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const hues = ['#FF1493', '#A855F7', '#00D4FF', '#00FF88', '#FF6B35'];
  const color = hues[index % hues.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:neon-border transition-all duration-300"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 0% 0%, ${color}08, transparent)` }}
      />
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
          style={{ background: `${color}20`, border: `1px solid ${color}50`, color }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm">{review.name}</p>
          {review.role && <p className="text-xs text-gray-500">{review.role}</p>}
          <StarWidget value={review.rating} size="sm" />
        </div>
        <span className="text-xs text-gray-600 font-mono flex-shrink-0">
          {new Date(review.created_at).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
        </span>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed italic">"{review.message}"</p>
    </motion.div>
  );
};

// ─── Reviews Section ──────────────────────────────────────────────────────────
const ReviewsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', role: '', rating: 5, message: '' });

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setReviews(data as Review[]);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSubmitting(true);
    setFormError('');
    const { error } = await supabase.from('reviews').insert({
      name: form.name.trim(),
      role: form.role.trim() || null,
      rating: form.rating,
      message: form.message.trim(),
    });
    if (error) {
      setFormError('Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
      await fetchReviews();
    }
    setSubmitting(false);
  };

  const ratingLabels: Record<number, string> = {
    5: 'Outstanding!', 4: 'Great work', 3: 'Good', 2: 'Fair', 1: 'Needs work'
  };

  return (
    <section id="reviews" className="py-32 px-6 relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-pink-neon/60 text-sm tracking-[0.3em] uppercase mb-4 block">Portfolio Reviews</span>
          <h2 className="font-display text-4xl md:text-6xl font-bold">
            <span className="glitch" data-text="RATE MY WORK">RATE MY WORK</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-lg mx-auto text-sm">
            Worked with me, reviewed my projects, or just exploring? Drop a rating below.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid md:grid-cols-3 gap-5 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          {/* Average */}
          <div className="glass-panel rounded-2xl p-6 text-center">
            <div className="font-display text-6xl font-bold text-pink-neon mb-2">
              {reviews.length ? avgRating.toFixed(1) : '—'}
            </div>
            <div className="flex justify-center mb-1">
              <StarWidget value={Math.round(avgRating)} size="lg" />
            </div>
            <p className="text-gray-500 text-sm">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
          </div>

          {/* Breakdown */}
          <div className="glass-panel rounded-2xl p-6">
            <h4 className="font-display text-xs text-pink-neon/60 mb-4 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> Breakdown
            </h4>
            <div className="space-y-2">
              {ratingCounts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">{star}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-pink-neon to-grid-purple"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' } : {}}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center gap-5">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-pink-neon" />
              <div>
                <p className="font-display text-2xl font-bold">{reviews.length}</p>
                <p className="text-xs text-gray-500">Total Reviewers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-grid-purple" />
              <div>
                <p className="font-display text-2xl font-bold">{reviews.filter((r) => r.rating >= 4).length}</p>
                <p className="text-xs text-gray-500">4+ Star Reviews</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Feed */}
          <div>
            <h3 className="font-display text-lg font-bold mb-5 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-neon" />
              Community Reviews
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 text-pink-neon animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center text-gray-500 text-sm">
                No reviews yet — be the first!
              </div>
            ) : (
              <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                {reviews.map((review, i) => (
                  <ReviewCard key={review.id} review={review} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Form */}
          <div>
            <h3 className="font-display text-lg font-bold mb-5 flex items-center gap-2">
              <Star className="w-5 h-5 text-pink-neon" />
              Leave a Review
            </h3>
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              <div className="scan-line absolute inset-0 pointer-events-none" />
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Your Name *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Jane Smith"
                          className="signal-input w-full text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Your Role</label>
                        <input
                          type="text"
                          value={form.role}
                          onChange={(e) => setForm({ ...form, role: e.target.value })}
                          placeholder="e.g. Tech Lead"
                          className="signal-input w-full text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-2 block">Your Rating *</label>
                      <div className="flex items-center gap-3">
                        <StarWidget
                          value={form.rating}
                          onChange={(v) => setForm({ ...form, rating: v })}
                          size="lg"
                        />
                        <span className="text-sm text-gray-400">{ratingLabels[form.rating]}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Your Message *</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Share your thoughts on Mekayla's work or portfolio..."
                        rows={4}
                        className="signal-input w-full resize-none text-sm"
                        required
                      />
                    </div>
                    {formError && <p className="text-red-400 text-xs">{formError}</p>}
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      className="glow-button w-full py-4 rounded-xl font-display font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {submitting
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <><Send className="w-5 h-5" />Submit Review</>
                      }
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    className="flex flex-col items-center justify-center py-16 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Star className="w-10 h-10 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                    <h4 className="font-display text-xl font-bold text-yellow-400 mb-2">Review Submitted!</h4>
                    <p className="text-gray-400 text-sm">Thank you for your feedback.</p>
                    <motion.button
                      onClick={() => { setSubmitted(false); setForm({ name: '', role: '', rating: 5, message: '' }); }}
                      className="mt-4 text-xs text-pink-neon hover:underline"
                      whileHover={{ scale: 1.05 }}
                    >
                      Leave another review
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); setIsSent(true); }, 2000);
  };

  const contactLinks = [
    { icon: Mail, label: 'Email', value: 'mekayladewee0@gmail.com', href: 'mailto:mekayladewee0@gmail.com' },
    { icon: Github, label: 'GitHub', value: 'github.com/MekaylaAmore', href: 'https://github.com/MekaylaAmore' },
    { icon: Linkedin, label: 'LinkedIn', value: 'linkedin.com/in/mekayla-de-wee', href: 'https://linkedin.com/in/mekayla-de-wee' },
  ];

  return (
    <section id="contact" className="min-h-screen py-32 px-6 relative" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-pink-neon/60 text-sm tracking-[0.3em] uppercase mb-4 block">Signal Transmission</span>
          <h2 className="font-display text-4xl md:text-6xl font-bold">
            <span className="glitch" data-text="LET'S BUILD TOGETHER">LET'S BUILD TOGETHER</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            Open to exciting opportunities, collaborations, and conversations about building great software.
          </p>
        </motion.div>

        <motion.div
          className="glass-panel rounded-2xl p-8 md:p-12 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="scan-line absolute inset-0 pointer-events-none" />

          <motion.div className="flex items-center gap-2 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-500 font-mono">OPEN TO OPPORTUNITIES · SIGNAL READY</span>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Links */}
            <div className="space-y-5">
              <h3 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                <Container className="w-5 h-5 text-pink-neon" />
                Direct Channels
              </h3>

              {contactLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-lg bg-black/30 border border-pink-neon/10 hover:border-pink-neon/40 transition-all group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="energy-node w-12 h-12 rounded-lg">
                    <link.icon className="w-5 h-5 text-pink-neon" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">{link.label}</span>
                    <p className="text-gray-300 group-hover:text-pink-neon transition-colors text-sm">{link.value}</p>
                  </div>
                </motion.a>
              ))}

              <div className="pt-4 border-t border-pink-neon/10">
                <p className="text-xs text-gray-500 font-mono">+27 60 419 2449 · Johannesburg, South Africa</p>
              </div>
            </div>

            {/* Form */}
            <div>
              <h3 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-pink-neon" />
                Send Message
              </h3>

              <AnimatePresence mode="wait">
                {!isSent ? (
                  <motion.form key="form" onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
                    <motion.input type="text" placeholder="Your Name" className="signal-input w-full" required initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} />
                    <motion.input type="email" placeholder="Your Email" className="signal-input w-full" required initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} />
                    <motion.textarea placeholder="Your Message" rows={4} className="signal-input w-full resize-none" required initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} />
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="glow-button w-full py-4 rounded-lg font-display font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <Container className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <><Send className="w-5 h-5" />Transmit Signal</>
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    className="flex flex-col items-center justify-center h-[280px] text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Zap className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <h4 className="font-display text-xl font-bold text-green-500 mb-2">Signal Received</h4>
                    <p className="text-gray-400 text-sm">Connection established. I'll be in touch soon!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-12 px-6 border-t border-pink-neon/10">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="text-center md:text-left">
        <span className="font-display text-xl font-bold chrome-text">MEKAYLA DEWEE</span>
        <p className="text-xs text-gray-500 mt-1">Junior Software Developer · Johannesburg, South Africa</p>
      </div>

      <div className="flex items-center gap-6">
        {[
          { href: 'https://github.com/MekaylaAmore', icon: Github },
          { href: 'https://linkedin.com/in/mekayla-de-wee', icon: Linkedin },
          { href: 'mailto:mekayladewee0@gmail.com', icon: Mail },
        ].map(({ href, icon: Icon }) => (
          <motion.a key={href} href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-neon transition-colors" whileHover={{ scale: 1.1 }}>
            <Icon className="w-5 h-5" />
          </motion.a>
        ))}
      </div>

      <p className="text-xs text-gray-600 font-mono">© 2026 · All systems operational</p>
    </div>
  </footer>
);

const App = () => {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
      reveals.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) el.classList.add('active');
      });
    };
    window.addEventListener('scroll', revealOnScroll);
    return () => window.removeEventListener('scroll', revealOnScroll);
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <CustomCursor />
      <AnimatedBackground />
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperienceSection />
        <DocumentsSection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default App;
