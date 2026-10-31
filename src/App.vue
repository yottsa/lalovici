<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  daysLabel,
  formatEndDate,
  hoursLabel,
  minutesLabel,
  pad2,
  secondsLabel,
  splitRemaining,
} from "./countdown";

const LONG_PRESS_MS = 3000;

const props = defineProps<{ endDate: Date; endMessage: string }>();

const remaining = ref(splitRemaining(props.endDate.getTime() - Date.now()));
const ended = ref(false);

let timerId: ReturnType<typeof setTimeout> | null = null;

const update = (): void => {
  const diffMs = props.endDate.getTime() - Date.now();
  remaining.value = splitRemaining(diffMs);
  if (diffMs <= 0) {
    ended.value = true;
    timerId = null;
    return;
  }
  // Schedule the next tick on the next whole-second boundary to avoid drift.
  timerId = setTimeout(update, (diffMs % 1000) || 1000);
};

onMounted(update);

onBeforeUnmount(() => {
  if (timerId !== null) clearTimeout(timerId);
  cancelPress();
});

const showDays = computed(() => remaining.value.days > 0);
const showHours = computed(() => showDays.value || remaining.value.hours > 0);
const showMinutes = computed(() => showHours.value || remaining.value.minutes > 0);

// Holding any card for LONG_PRESS_MS opens a dialog with the end date.
const dialog = ref<HTMLDialogElement | null>(null);
const formattedEndDate = formatEndDate(props.endDate);
let pressId: ReturnType<typeof setTimeout> | null = null;

const startPress = (): void => {
  cancelPress();
  pressId = setTimeout(() => {
    pressId = null;
    dialog.value?.showModal();
  }, LONG_PRESS_MS);
};

function cancelPress(): void {
  if (pressId !== null) clearTimeout(pressId);
  pressId = null;
}

const closeDialog = (): void => dialog.value?.close();

// A click on the backdrop lands on the <dialog> itself, not its content.
const onDialogClick = (event: MouseEvent): void => {
  if (event.target === dialog.value) closeDialog();
};

const cardEvents = {
  pointerdown: startPress,
  pointerup: cancelPress,
  pointerleave: cancelPress,
  pointercancel: cancelPress,
  // Stop the long-press context menu and text selection on touch devices;
  // either would otherwise fire pointercancel and abort the press.
  contextmenu: (event: Event) => event.preventDefault(),
  selectstart: (event: Event) => event.preventDefault(),
};
</script>

<template>
  <div v-if="ended" class="ended" role="status" aria-live="polite">
    {{ endMessage }}
  </div>
  <div v-else class="countdown" role="timer">
    <div class="card" v-if="showDays" v-on="cardEvents">
      <div class="num">{{ remaining.days }}</div>
      <div class="label">{{ daysLabel(remaining.days) }}</div>
    </div>
    <div class="card" v-if="showHours" v-on="cardEvents">
      <div class="num">{{ pad2(remaining.hours) }}</div>
      <div class="label">{{ hoursLabel(remaining.hours) }}</div>
    </div>
    <div class="card" v-if="showMinutes" v-on="cardEvents">
      <div class="num">{{ pad2(remaining.minutes) }}</div>
      <div class="label">{{ minutesLabel(remaining.minutes) }}</div>
    </div>
    <div class="card" v-on="cardEvents">
      <div class="num">{{ pad2(remaining.seconds) }}</div>
      <div class="label">{{ secondsLabel(remaining.seconds) }}</div>
    </div>
  </div>

  <dialog
    ref="dialog"
    class="end-date-dialog"
    aria-labelledby="end-date-title"
    @click="onDialogClick"
  >
    <div id="end-date-title" class="label">Odbrojavanje do</div>
    <p class="end-date">{{ formattedEndDate }}</p>
    <button type="button" @click="closeDialog">Zatvori</button>
  </dialog>
</template>

<style scoped>
/* Applied to the card's text too: user-select isn't reliably inherited (iOS). */
.card,
.card * {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

/* No native gestures start on a card, so the browser never cancels the press. */
.card {
  touch-action: none;
}

.end-date-dialog {
  border: none;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  padding: 1.5rem 1.75rem;
  max-width: min(90vw, 26rem);
  text-align: center;
  font-family: inherit;
}

.end-date-dialog::backdrop {
  background: rgba(0, 0, 0, 0.35);
}

.end-date {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.75rem 0 1.25rem;
}

.end-date-dialog button {
  font: inherit;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 8px;
  background: #222;
  color: #fff;
  cursor: pointer;
}
</style>
