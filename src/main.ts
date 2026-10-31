import { createApp } from "vue";
import { registerSW } from "virtual:pwa-register";
import App from "./App.vue";

// `||` (not `??`): in CI an unset `${{ vars.X }}` is passed as "", not undefined.
// VITE_END_DATE is validated at build time in vite.config.ts.
const END_ISO: string = import.meta.env.VITE_END_DATE || "2026-03-31T12:00:00+02:00";
const END_MESSAGE: string = import.meta.env.VITE_END_MESSAGE || "Dobrodošao!";

createApp(App, { endDate: new Date(END_ISO), endMessage: END_MESSAGE }).mount("#app");

registerSW({ immediate: true });
