// src/features/services/ServiceCards.tsx

"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ServiceDto } from "@/integrations/types/services.types";

import ServiceCard from "./ServiceCard";

export default function ServiceCards({
    service,
    locale,
}: {
    service: ServiceDto;
    locale: string;
}) {
    return (
        <div style={{ position: "relative", minHeight: 360 }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.35 }}
                >
                    <ServiceCard service={service} locale={locale} />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
