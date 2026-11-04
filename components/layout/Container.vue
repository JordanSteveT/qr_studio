<script setup lang="ts">
interface Props {
  as?: string
  fluid?: boolean
}

withDefaults(defineProps<Props>(), {
  as: 'div',
  fluid: false
})
</script>

<template>
  <component
    :is="as"
    class="app-container"
    :class="{ 'app-container--fluid': fluid }"
  >
    <slot />
  </component>
</template>

<style scoped>
.app-container {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

.app-container--fluid {
  max-width: 100%;
}
</style>
