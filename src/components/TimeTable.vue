<template>
    <div class="mx-auto w-11/12 md:w-3/4 lg:w-1/2 flex flex-wrap md:flex-nowrap">
      <label class="search-label w-full md:w-2/12" for="station-select">Station</label>
      <input 
        class="search-input font-bold w-full md:w-7/12 rounded-full border-4 border-gray-400 shadow-md" 
        list="stationList" 
        id="station-select" 
        name="station-select" 
        v-model="store.searchTerm" 
        placeholder="Select Station" 
      />
      <datalist id="stationList">
          <option v-for="(station, index) in store.stations" :key="index">{{station.name}}</option>
      </datalist>
      <button 
        class="search-button rounded-full bg-green-500 hover:bg-green-800 text-white font-bold w-full md:w-3/12 ml-0 md:ml-3 mt-3 md:mt-0 shadow-md" 
        @click="store.search()"
        :disabled="store.loading"
      >
        {{ store.loading ? 'Searching...' : 'Search' }}
      </button>
      <a href="#" class="text-blue-400 underline mt-3 md:mt-0 text-right" @click="store.toggleAdvancedOptions()">Advanced Options</a>
    </div>

    <div class="relative mx-auto w-11/12 md:w-3/4 lg:w-1/2 mt-4 bg-green-100 pt-2 pb-8 px-4 rounded-lg" v-if="store.showAdvancedOptions">
      <div class="flex flex-col">
        <h2 class="search-label">Favourite</h2>
        <p class="pl-2">Save this station in your favourites.</p>
        <button 
          class="bg-green-500 hover:bg-green-800 text-white font-bold w-1/2 my-4 rounded-full leading-10" 
          @click="store.favoriteStation()"
        >
          <span v-if="store.isFavorited">Favourited</span>
          <span v-else>Favourite</span>
        </button>
        
        <label class="search-label w-full" for="direction">Direction</label>
        <input 
          class="search-input font-bold w-full rounded-full border-2 border-gray-400 shadow-md" 
          list="directionList" 
          id="direction" 
          name="direction" 
          v-model="store.direction" 
          placeholder="Direction" 
        />
        <datalist id="directionList">
            <option>Southbound</option>
            <option>Northbound</option>
            <option>To Cork</option>
            <option>To Westport</option>
            <option>To Dublin Heuston</option>
        </datalist>
        <p class="p-2">Example: 'Northbound', 'Southbound', 'To Cork', 'To Westport'</p>
        
        <label class="search-label w-full" for="minutes">Number of Minutes</label>
        <input 
          class="search-input font-bold w-full rounded-full border-2 border-gray-400 shadow-md" 
          id="minutes" 
          name="minutes" 
          v-model="store.numOfMins" 
          placeholder="Number of Minutes" 
        />
      </div>
    </div>

    <div class="w-11/12 md:w-3/4 lg:w-1/2 mx-auto m-8">
      <div v-if="store.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ store.error }}
      </div>
      
      <div class="w-full border-collapse rounded-lg border-4 p-4 border-yellow-200 subway-font bg-gray-700 shadow-xl">
        <div v-if="store.loading" class="text-yellow-200 text-3xl leading-9 text-center">
          Loading...
        </div>
        
        <table v-else-if="store.hasTimetable" class="text-yellow-200 text-xl md:text-3xl leading-9 w-full">
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th class="p-3 text-xl">Destination</th>
              <th class="p-3 text-xl text-right">Due</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in store.timetable" :key="index">
              <td class="p-3">{{index+1}}</td>
              <td class="p-3">{{item.destination}}</td>
              <td v-if="item.due === '0'" class="p-3 text-right">Due</td>
              <td v-else class="p-3 text-right">{{item.due}} min(s)</td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="text-yellow-200 text-3xl leading-9">
          No timetable data for this station based on the search criteria
        </div>
      </div>
      
      <button 
        class="text-blue-400 underline m-4" 
        @click="reload()"
        :disabled="store.loading"
      >
        {{ store.loading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>
</template>

<script>
import { useTimetableStore } from '@/store'

export default {
  name: 'TimeTable',
  setup() {
    const store = useTimetableStore()
    return { store }
  },
  
  created() {
    // Initialize the app
    this.store.loadStations()
    this.store.checkForCookie()
    this.store.loadTimetableData()

    // Set up auto-refresh
    this.refreshInterval = setInterval(() => {
      const d = new Date()
      this.store.search()
      console.log('Auto-refresh', d.toString())
    }, 60000)
  },

  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },

  methods: {
    reload() {
      const d = new Date()
      this.store.search()
      console.log('Manual reload', d.toString())
    }
  }
}
</script>