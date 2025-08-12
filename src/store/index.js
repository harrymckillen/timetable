import { defineStore } from 'pinia'
import axios from 'axios'
import { parseStationListXML, getStationDataByCodeXML } from '@/utils/xmlParser.util'
import { setCookie, getCookie } from '@/utils/cookie.util'

export const useTimetableStore = defineStore('timetable', {
  state: () => ({
    stations: [],
    timetable: [],
    searchTerm: 'Dublin Pearse',
    searchCode: 'PERSE',
    direction: 'Southbound',
    numOfMins: 25,
    cookieName: 'favStation',
    cookieStationCode: '',
    showAdvancedOptions: false,
    loading: false,
    error: null,
    // API URLs
    stationListUrl: '/api/realtime/realtime.asmx/getAllStationsXML',
    timetableDetailUrl: '/api/realtime/realtime.asmx/getStationDataByCodeXML_WithNumMins'
  }),

  getters: {
    hasStations: (state) => state.stations && state.stations.length > 0,
    hasTimetable: (state) => state.timetable && state.timetable.length > 0,
    isFavorited: (state) => state.searchCode === state.cookieStationCode
  },

  actions: {
    async loadStations() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(this.stationListUrl)
        console.log('Station list response:', response)
        const data = await parseStationListXML(response.data)
        console.log('Parsed station list:', data)
        this.stations = data
      } catch (error) {
        this.error = 'Failed to load stations'
        console.error('Error loading stations:', error)
      } finally {
        this.loading = false
      }
    },

    async loadTimetableData(stationCode = this.searchCode, direction = this.direction, mins = this.numOfMins) {
      this.loading = true
      this.error = null
      
      try {
        const url = `${this.timetableDetailUrl}?NumMins=${mins}&StationCode=${stationCode}`
        console.log('Timetable URL:', url)
        const response = await axios.get(url)
        const data = await getStationDataByCodeXML(response.data, direction)
        console.log('Timetable data:', data)
        this.timetable = data
      } catch (error) {
        this.error = 'Failed to load timetable data'
        console.error('Error loading timetable:', error)
      } finally {
        this.loading = false
      }
    },

    getStationCode(stationName) {
      const station = this.stations.find(station => station.name === stationName)
      return station ? station.code : false
    },

    search() {
      this.searchCode = this.getStationCode(this.searchTerm)
      if (this.searchCode) {
        this.loadTimetableData()
      }
    },

    favoriteStation() {
      const station = {
        name: this.searchTerm,
        code: this.searchCode
      }
      setCookie(this.cookieName, JSON.stringify(station), 365)
      this.checkForCookie()
    },

    checkForCookie() {
      const cookie = getCookie(this.cookieName)
      if (cookie) {
        const favStation = JSON.parse(cookie)
        this.cookieStationCode = favStation.code
        this.searchCode = favStation.code
        this.searchTerm = favStation.name
      }
    },

    toggleAdvancedOptions() {
      this.showAdvancedOptions = !this.showAdvancedOptions
    },

    updateSearchTerm(term) {
      this.searchTerm = term
    },

    updateDirection(dir) {
      this.direction = dir
    },

    updateNumOfMins(mins) {
      this.numOfMins = mins
    }
  }
})