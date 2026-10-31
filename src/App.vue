<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  daysLabel,
  hoursLabel,
  minutesLabel,
  pad2,
  secondsLabel,
  splitRemaining,
} from "./countdown";

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
});

const showDays = computed(() => remaining.value.days > 0);
const showHours = computed(() => showDays.value || remaining.value.hours > 0);
const showMinutes = computed(() => showHours.value || remaining.value.minutes > 0);
</script>

<template>
  <div v-if="ended" class="ended" role="status" aria-live="polite">
    {{ endMessage }}
  </div>
  <div v-else class="countdown" role="timer">
    <div class="card" v-if="showDays">
      <div class="num">{{ remaining.days }}</div>
      <div class="label">{{ daysLabel(remaining.days) }}</div>
    </div>
    <div class="card" v-if="showHours">
      <div class="num">{{ pad2(remaining.hours) }}</div>
      <div class="label">{{ hoursLabel(remaining.hours) }}</div>
    </div>
    <div class="card" v-if="showMinutes">
      <div class="num">{{ pad2(remaining.minutes) }}</div>
      <div class="label">{{ minutesLabel(remaining.minutes) }}</div>
    </div>
    <div class="card">
      <div class="num">{{ pad2(remaining.seconds) }}</div>
      <div class="label">{{ secondsLabel(remaining.seconds) }}</div>
    </div>
  </div>
</template>
