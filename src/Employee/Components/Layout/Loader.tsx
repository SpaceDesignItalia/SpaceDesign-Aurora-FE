import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Loader() {
  const [loading, setLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Simula un caricamento (puoi sostituire questo con chiamate API reali)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true); // Inizia l'uscita
      setTimeout(() => setLoading(false), 300); // Nascondi il loader dopo 300ms
    }, 2300); // Ridotto da 2500 a 1500 ms

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && (
        <motion.div
          className="fixed top-0 z-50 flex min-h-screen w-full items-center justify-center backdrop-blur-lg backdrop-filter"
          initial={{ opacity: 1 }} // Opacità iniziale
          animate={{ opacity: isExiting ? 0 : 1 }} // Cambia l'opacità in base allo stato di uscita
          transition={{ duration: 0.2 }} // Durata della transizione
        >
          <div className="relative h-64 w-64 p-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1000 1000"
              className="h-full w-full drop-shadow-lg"
            >
              <defs>
                <motion.linearGradient
                  id="rocketGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <motion.stop
                    stopColor="black"
                    stopOpacity="1"
                    offset="0%"
                    animate={{
                      offset: ["0%", "100%"],
                    }}
                    transition={{
                      duration: 0.5, // Ridotto da 1.5 a 1 secondo
                      delay: 1, // Ridotto da 2 a 1 secondo
                      ease: "easeInOut",
                    }}
                  />
                  <motion.stop
                    stopColor="black"
                    stopOpacity="0"
                    offset="0%"
                    animate={{
                      offset: ["0%", "100%"],
                    }}
                    transition={{
                      duration: 0.5, // Ridotto da 1.5 a 1 secondo
                      delay: 1, // Ridotto da 2 a 1 secondo
                      ease: "easeInOut",
                    }}
                  />
                </motion.linearGradient>
                <motion.linearGradient
                  id="flameGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <motion.stop
                    stopColor="red"
                    stopOpacity="1"
                    offset="0%"
                    animate={{
                      offset: ["0%", "100%"],
                    }}
                    transition={{
                      duration: 0.5, // Ridotto da 1.5 a 1 secondo
                      delay: 1, // Ridotto da 2 a 1 secondo
                      ease: "easeInOut",
                    }}
                  />
                  <motion.stop
                    stopColor="red"
                    stopOpacity="0"
                    offset="0%"
                    animate={{
                      offset: ["0%", "100%"],
                    }}
                    transition={{
                      duration: 0.5, // Ridotto da 1.5 a 1 secondo
                      delay: 1, // Ridotto da 2 a 1 secondo
                      ease: "easeInOut",
                    }}
                  />
                </motion.linearGradient>
              </defs>
              <motion.path
                d="m853.8 225.7c-13.7 36.7-38.8 90.5-84.8 144.8-53.5 63.4-111.8 99.5-148.8 118.6-7 34.8-19.8 60.6-30.5 78-31.1 50-74 75.4-108.2 95.6-30.8 18.2-58.4 29.3-77.5 35.9 3.7-2.3 48.1-30.6 49.3-81.6 0.7-29.4-13.3-50.8-19-58.5 79-39.4 142.5-79 190-111.5 103.6-70.9 143.3-116.5 170.1-156.4 9.3-13.8 16.3-25.8 20.9-34.1-31.8 4.4-78.8 13.9-131.5 37-63.7 27.9-105.4 62.3-143.2 93.5-28.7 23.6-66.6 58-106.3 104.7 0.9 1.4 2.6 3.4 5.2 5.1 8.7 5.7 25.7 6.5 91.8-36.4 13.8-9 32.9-21.8 55-38.5-15.9 18.9-34.9 39-57.6 59-51.6 45.6-103.6 74-144.8 91.9q17.5-17.7 35-35.4c-9.5-8.6-28-22.9-55-29.3-51.8-12.2-93.5 14.7-101.6 20.1 19.8-26.2 61.4-73.5 130.4-106.3 54.4-25.9 103.9-32.4 134.5-33.9 28.5-30.1 74.4-71.6 140.2-105.8 74.5-38.7 142.8-51.7 186.4-56.5z"
                fill="none"
                stroke="black"
                strokeWidth="10"
                strokeMiterlimit="10"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }} // Ridotto da 1.5 a 1 secondo
              />
              <motion.path
                d="m406 538.9l-35.9-23.3-121.7 118.3 37-10.8-139.2 137.1 141.7-105.7-19.5 27.7 174.1-89.3-15.9-29.3-63.2 23.1z"
                fill="none"
                stroke="red"
                strokeWidth="10"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }} // Ridotto da 1.5 a 1 secondo
              />
              <motion.path
                d="m853.8 225.7c-13.7 36.7-38.8 90.5-84.8 144.8-53.5 63.4-111.8 99.5-148.8 118.6-7 34.8-19.8 60.6-30.5 78-31.1 50-74 75.4-108.2 95.6-30.8 18.2-58.4 29.3-77.5 35.9 3.7-2.3 48.1-30.6 49.3-81.6 0.7-29.4-13.3-50.8-19-58.5 79-39.4 142.5-79 190-111.5 103.6-70.9 143.3-116.5 170.1-156.4 9.3-13.8 16.3-25.8 20.9-34.1-31.8 4.4-78.8 13.9-131.5 37-63.7 27.9-105.4 62.3-143.2 93.5-28.7 23.6-66.6 58-106.3 104.7 0.9 1.4 2.6 3.4 5.2 5.1 8.7 5.7 25.7 6.5 91.8-36.4 13.8-9 32.9-21.8 55-38.5-15.9 18.9-34.9 39-57.6 59-51.6 45.6-103.6 74-144.8 91.9q17.5-17.7 35-35.4c-9.5-8.6-28-22.9-55-29.3-51.8-12.2-93.5 14.7-101.6 20.1 19.8-26.2 61.4-73.5 130.4-106.3 54.4-25.9 103.9-32.4 134.5-33.9 28.5-30.1 74.4-71.6 140.2-105.8 74.5-38.7 142.8-51.7 186.4-56.5z"
                fill="url(#rocketGradient)"
              />
              <motion.path
                d="m406 538.9l-35.9-23.3-121.7 118.3 37-10.8-139.2 137.1 141.7-105.7-19.5 27.7 174.1-89.3-15.9-29.3-63.2 23.1z"
                fill="url(#flameGradient)"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </>
  );
}
