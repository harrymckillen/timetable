import { XMLParser } from "fast-xml-parser";

export function parseStationListXML(data) {
  let array = [];
  return new Promise((resolve, reject) => {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        parseAttributeValue: true,
        trimValues: true
      });
      
      const result = parser.parse(data);
      const obj = result.ArrayOfObjStation;
      
      if (obj && obj.objStation) {
        const stations = Array.isArray(obj.objStation) ? obj.objStation : [obj.objStation];
        
        for (let station of stations) {
          array.push({
            code: station.StationCode,
            name: station.StationDesc,
            alias: station.StationAlias,
          });
        }
      }
      
      resolve(array);
    } catch (err) {
      reject(err);
    }
  });
}

export function getStationDataByCodeXML(data, direction) {
  let array = [];

  if (direction === "") direction = "Southbound";

  return new Promise((resolve, reject) => {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        parseAttributeValue: true,
        trimValues: true
      });
      
      const result = parser.parse(data);
      const obj = result.ArrayOfObjStationData;

      if (obj && obj.objStationData) {
        const stationData = Array.isArray(obj.objStationData) ? obj.objStationData : [obj.objStationData];
        
        for (let station of stationData) {
          if (station.Direction && station.Direction.toLowerCase() === direction.toLowerCase()) {
            array.push({
              code: station.Stationcode,
              name: station.Stationfullname,
              direction: station.Direction,
              origin: station.Origin,
              destination: station.Destination,
              due: station.Duein,
            });
          }
        }
        
        // Sort Array by 'Due In' time
        array.sort(function (a, b) {
          return a.due - b.due;
        });
      }

      // return a max of 3 items
      const slicedArray = array.slice(0, 3);
      resolve(slicedArray);
    } catch (err) {
      reject(err);
    }
  });
}
