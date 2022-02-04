<template>
    <div class="mx-auto w-11/12 md:w-3/4 lg:w-1/2 flex flex-wrap md:flex-nowrap">
      <label class="search-label w-full md:w-2/12" for="station-select">Station</label>
      <input class="search-input font-bold w-full md:w-7/12 rounded-full border-4 border-gray-400 shadow-md" list="stationList" id="station-select" name="station-select" v-model="searchTerm" placeholder="Select Station" />
      <datalist id="stationList">
          <option v-for="(station, index) in stations" :key="index">{{station.name}}</option>
      </datalist>
      <button class="search-button rounded-full bg-green-500 hover:bg-green-800 text-white font-bold w-full md:w-3/12 ml-0 md:ml-3 mt-3 md:mt-0 shadow-md" @click="search()">Search</button>
      <a href="#" class="text-blue-400 underline mt-3 md:mt-0 text-right" @click="showAdvancedOptions = !showAdvancedOptions">Advanced Options</a>
    </div>
    <div class="relative mx-auto w-11/12 md:w-3/4 lg:w-1/2 mt-4 bg-green-100 pt-2 pb-8 px-4 rounded-lg" v-if="showAdvancedOptions">
      <div class="flex flex-col">
        <h2 class="search-label">Favourite</h2>
        <p class="pl-2">Save this station in your favourites.</p>
        <button class="bg-green-500 hover:bg-green-800 text-white font-bold w-1/2 my-4 rounded-full leading-10" @click="favouriteStation()">
          <span v-if="searchCode === cookieStationCode">Favourited</span>
          <span v-else>Favourite</span>
        </button>
        <label class="search-label w-full" for="direction">Direction</label>
        <input class="search-input font-bold w-full rounded-full border-2 border-gray-400 shadow-md" list="directionList" id="direction" name="direction" v-model="direction" placeholder="Direction" />
        <datalist id="directionList">
            <option>Southbound</option>
            <option>Northbound</option>
            <option>To Cork</option>
            <option>To Westport</option>
            <option>To Dublin Heuston</option>
        </datalist>
        <p class="p-2">Example: 'Northbound', 'Southbound', 'To Cork', 'To Westport'</p>
        <label class="search-label w-full" for="minutes">Number of Minutes</label>
        <input class="search-input font-bold w-full rounded-full border-2 border-gray-400 shadow-md" id="minutes" name="minutes" v-model="numOfMins" placeholder="Number of Minutes" />
      </div>
    </div>

    <div class="w-11/12 md:w-3/4 lg:w-1/2 mx-auto m-8">
      <div class="w-full border-collapse rounded-lg border-4 p-4 border-yellow-200 subway-font bg-gray-700 shadow-xl">
        <table v-if="timetable?.length > 0" class="text-yellow-200 text-xl md:text-3xl  leading-9 w-full">
          <thead>
            <td>&nbsp;</td>
            <td class="p-3 text-xl">Destination</td>
            <td class="p-3 text-xl text-right">Due</td>
          </thead>
          <tr v-for="(item, index) in timetable" :key="index">
            <td class="p-3">{{index+1}}</td>
            <td class="p-3">{{item.destination}}</td>
            <td v-if="item.due === '0'" class="p-3 text-right">Due</td>
            <td v-if="item.due !== '0'" class="p-3 text-right">{{item.due}} min(s)</td>
          </tr>
        </table>
        <div v-else class="text-yellow-200 text-3xl leading-9">No timetable data for this station based on the search criteria</div>
      </div>
      <button class="text-blue-400 underline m-4" @click="reload()">Refresh</button>
    </div>
</template>

<script>

import { parseStationListXML, getStationDataByCodeXML } from '@/utils/xmlParser.util';
import { setCookie, getCookie } from '@/utils/cookie.util';

export default {
  name: 'TimeTable',
  data () {
    return {
      stationListUrl: 'https://justcors.com/l_1ve8kxkto7/api.irishrail.ie/realtime/realtime.asmx/getAllStationsXML', 
      timetableDetailUrl: 'https://justcors.com/l_1ve8kxkto7/api.irishrail.ie/realtime/realtime.asmx/getStationDataByCodeXML_WithNumMins', 
      cookieName: 'favStation',
      cookieStationCode: '',
      stations: null,
      timetable: null,
      numOfMins: 25,
      refresh: 0, 
      showAdvancedOptions: false,

      // default station when there is no cookie
      direction: 'Southbound', 
      searchTerm: 'Dublin Pearse',
      searchCode: 'PERSE'
    }
  },
  created () {
    // When page is loaded, this specifies the default timetable displayed for Dublin Pearse, Southbound


    // loads the station list for the datalist element
    this.loadStations(this.stationListUrl);
    
    // checks for cookie, if it exists, it overwrites the defaults
    this.checkForCookie();

    // takes url, stationCode, and direction
    this.loadTimeTableData(this.timetableDetailUrl, this.searchCode , this.direction, this.numOfMins);

    // creates auto refresh every 1 min
    this.refresh = setInterval(() => {
      const d = new Date();
      this.search();
      console.log('Auto-refresh', d.toString());
    }, 60000);
  },
  methods: {
    search(){
      // fetches the train stations' code from the list of stations
      this.searchCode = this.getStationCode(this.searchTerm);
      this.loadTimeTableData(this.timetableDetailUrl, this.searchCode, this.direction, this.numOfMins);
    },
    reload() {
      const d = new Date();
      this.search();
      console.log('Manual reload', d.toString());
    },
    getStationCode(text){
      const stationCode = this.stations.filter(station => station.name === text);
      if(stationCode.length > 0)
      return stationCode[0].code;
      else return false;
    },
    loadStations(url){
      this.axios.get(url)
      .then(response => {
        parseStationListXML(response.data)
        .then(data => { 
          this.stations = data;
        })
      })
      .catch(e => {
        console.log(e);
      });
    },
    loadTimeTableData(url, stationCode, direction, mins){
      url = `${url}?NumMins=${mins}&StationCode=${stationCode}`; 
      this.axios.get(url)
      .then(response => {
        getStationDataByCodeXML(response.data, direction)
        .then(data => { 
          this.timetable = data;
        })
      })
      .catch(e => {
        console.log(e);
      });
    },
    favouriteStation(){
      let station = {
        name: this.searchTerm, 
        code: this.searchCode
      }
      setCookie(this.cookieName, JSON.stringify(station), 365);
      this.checkForCookie();
    }, 
    checkForCookie(){
      const cookie = getCookie(this.cookieName);
      if(cookie){
        const favStation = JSON.parse(cookie);
        this.cookieStationCode = favStation.code;
        this.searchCode = favStation.code;
        this.searchTerm = favStation.name;
      }
    }

  }
}
</script>

<style scoped>
  .search-label, .search-input, .search-button {
    font-size: 1.2em; 
    padding: 0.5em 1em;
    line-height: 1.4em;
  }
  .search-label{
    font-weight: bold;
    padding-top: 0.75em;
  }
</style>
