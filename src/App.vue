<template>
  <h1 class="text-6xl subway-font text-center m-8 text-green-700">Real-time Train Schedule</h1>
  <TimeTable/>
</template>

<script>
import TimeTable from '@/components/TimeTable.vue'

export default {
  name: 'App',
  components: {
    TimeTable
  }
}
</script>

<style>

</style>
