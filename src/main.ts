import { createApp, ref, computed, onMounted, onBeforeUnmount } from 'vue';

const END_ISO: string = import.meta.env.VITE_END_DATE ?? "2026-03-31T12:00:00+02:00";
const END_MESSAGE: string = import.meta.env.VITE_END_MESSAGE ?? "Dobrodošao!";

const hoursSet = new Set<number>([2, 3, 4]);
const secondsSet = new Set<number>([2, 3, 4]);

createApp({
  setup() {
    const endMessage = ref<string>(END_MESSAGE);
    const endDate = new Date(END_ISO);

    const days = ref<number>(0);
    const hours = ref<number>(0);
    const minutes = ref<number>(0);
    const seconds = ref<number>(0);
    const ended = ref<boolean>(false);

    const update = (): void => {
      const now = new Date();
      let diffMs = endDate.getTime() - now.getTime();
      if (diffMs <= 0) {
        ended.value = true;
        days.value = hours.value = minutes.value = seconds.value = 0;
        return;
      }

      const msInSecond = 1000;
      const msInMinute = 60 * msInSecond;
      const msInHour = 60 * msInMinute;
      const msInDay = 24 * msInHour;

      days.value = Math.floor(diffMs / msInDay);
      diffMs %= msInDay;

      hours.value = Math.floor(diffMs / msInHour);
      diffMs %= msInHour;

      minutes.value = Math.floor(diffMs / msInMinute);
      diffMs %= msInMinute;

      seconds.value = Math.floor(diffMs / msInSecond);
    };

    let timerId: ReturnType<typeof setInterval> | null = null;

    onMounted(() => {
      update();
      timerId = setInterval(update, 1000);
    });

    onBeforeUnmount(() => {
      if (timerId !== null) clearInterval(timerId);
    });

    const hoursPadded = computed(() => String(hours.value).padStart(2, "0"));
    const minutesPadded = computed(() =>
      String(minutes.value).padStart(2, "0")
    );
    const secondsPadded = computed(() =>
      String(seconds.value).padStart(2, "0")
    );

    const showDays = computed(() => days.value > 0);
    const showHours = computed(() => days.value > 0 || hours.value > 0);
    const showMinutes = computed(
      () => days.value > 0 || hours.value > 0 || minutes.value > 0
    );
    const showSeconds = computed(() => true);

    const daysLabel = computed(() =>
      days.value % 10 === 1 && days.value % 100 !== 11 ? "dan" : "dana"
    );
    const hoursLabel = computed(() =>
      hours.value === 1 ? "sat" : hoursSet.has(hours.value) ? "sata" : "sati"
    );
    const minutesLabel = computed(() =>
      minutes.value === 1 ? "minut" : "minuta"
    );
    const secondsLabel = computed(() =>
      seconds.value === 1
        ? "sekund"
        : secondsSet.has(seconds.value)
        ? "sekunde"
        : "sekundi"
    );

    return {
      endMessage,
      days,
      hours,
      minutes,
      seconds,
      hoursPadded,
      minutesPadded,
      secondsPadded,
      showDays,
      showHours,
      showMinutes,
      showSeconds,
      daysLabel,
      hoursLabel,
      minutesLabel,
      secondsLabel,
      ended,
    };
  },
}).mount("#app");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg: ServiceWorkerRegistration) => {
        console.log("Service Worker registered:", reg);

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log("New version found — activating...");
                newWorker.postMessage("skipWaiting");
              }
            });
          }
        });

        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("Reloading for new SW...");
          window.location.reload();
        });
      })
      .catch((err: unknown) =>
        console.error("Service Worker registration failed:", err)
      );
  });
}
