<template>
  <Transition
    appear
    mode="out-in"
    enter-active-class="transition duration-500 ease-bounce motion-reduce:transition-none"
    enter-from-class="translate-y-5 scale-97 opacity-0"
    leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
    leave-to-class="-translate-y-1 scale-99 opacity-0"
  >
    <slot />
  </Transition>
</template>
