import { motion } from "motion/react";
import type { ReactNode } from "react";

function PageTransition({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
                width: "100%",
                minWidth: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {children}
        </motion.div>
    )
}

export default PageTransition
