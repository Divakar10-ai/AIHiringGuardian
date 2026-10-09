import { motion } from 'framer-motion';
import { AppLogo } from './AppLogo';
import infrastructureImg from '../assets/images/ai-infrastructure.jpg';

export const SplashScreen = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#050B14]"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={infrastructureImg} 
          alt="Enterprise AI Environment" 
          className="w-full h-full object-cover mix-blend-luminosity opacity-40" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#091225]/80 to-transparent mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050B14]/90 via-transparent to-[#050B14]"></div>
      </div>

      {/* Floating Particles / Light Effects */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-400/20 blur-xl"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * -100 - 50],
              opacity: [0, 0.5, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Logo */}
          <div className="bg-white/5 p-4 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(34,211,238,0.15)] mb-8 backdrop-blur-xl group">
            <AppLogo className="h-16 w-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          </div>

          {/* Branding */}
          <h1 className="text-5xl font-black tracking-[0.15em] text-white leading-tight font-sans text-center mb-4">
            AI HIRING<br />GUARDIAN
          </h1>
          <p className="text-lg text-slate-300 font-light tracking-[0.2em] uppercase mb-16">
            Fair. Transparent. Compliant.
          </p>

          {/* Animated Loading Bar */}
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2.5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xs text-slate-500 font-semibold tracking-widest uppercase mt-6"
          >
            Initializing enterprise environment
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};
