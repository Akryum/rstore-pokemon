<script lang="ts" setup>
const { addRandomPokemon } = useRandomPokemon()
</script>

<template>
  <UButton
    icon="lucide:dices"
    color="neutral"
    variant="subtle"
    :loading="addRandomPokemon.$loading"
    @click="addRandomPokemon"
  >
    <span class="max-sm:hidden">Random</span>
  </UButton>
</template>
