import type { NextConfig } from "next";
import { config } from "dotenv";

// Ключі проєкту з .env важливіші за однойменні системні змінні (на цьому ПК їх кілька).
config({ override: true });

const nextConfig: NextConfig = {};

export default nextConfig;
