// src/features/services/ServiceSpines.tsx

"use client";

import { motion } from "framer-motion";
import type { ServiceDto } from "@/integrations/types/services.types";

export default function ServiceSpines({
    items,
    activeId,
    onSelect,
}: {
    items: ServiceDto[];
    activeId?: string;
    onSelect: (id: string) => void;
}) {
    return (
        <div style={{ display: "flex", gap: 12 }}>
            {items.map((svc, i) => {
                const isActive = svc.id === activeId;

                return (
                    <motion.button
                        key={svc.id}
                        onClick={() => onSelect(svc.id)}
                        animate={{
                            backgroundColor: isActive ? "#2563eb" : "#1e40af",
                        }}
                        style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            padding: "16px 10px",
                            borderRadius: 12,
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "none",
                            minHeight: 260,
                        }}
                    >
                        {svc.name}
                    </motion.button>
                );
            })}
        </div>
    );
}
