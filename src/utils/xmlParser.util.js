import xml2js from "xml2js";

export function parseStationListXML(data) {
  let array = [];
  return new Promise((resolve) => {
    let parser = new xml2js.Parser({
      trim: true,
      explicitArray: false,
    });
    parser.parseString(data, function (err, result) {
      let obj = result.ArrayOfObjStation;
      for (let station of obj.objStation) {
        array.push({
          code: station.StationCode,
          name: station.StationDesc,
          alias: station.StationAlias,
        });
      }
      resolve(array);
    });
  });
}

export function getStationDataByCodeXML(data, direction) {
  let array = [];

  if (direction === "") direction = "Southbound";

  return new Promise((resolve) => {
    let parser = new xml2js.Parser({
      trim: true,
      explicitArray: false,
    });
    parser.parseString(data, function (err, result) {
      let obj = result.ArrayOfObjStationData;

      if (
        obj.objStationData !== undefined &&
        Array.isArray(obj.objStationData)
      ) {
        for (let station of obj.objStationData) {
          if (station.Direction.toLowerCase() === direction.toLowerCase()) {
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
      } else if (
        obj.objStationData !== undefined &&
        !Array.isArray(obj.objStationData)
      ) {
        array.push({
          code: obj.objStationData.Stationcode,
          name: obj.objStationData.Stationfullname,
          direction: obj.objStationData.Direction,
          origin: obj.objStationData.Origin,
          destination: obj.objStationData.Destination,
          due: obj.objStationData.Duein,
        });
      }

      // return a max of 3 items
      const slicedArray = array.slice(0, 3);
      resolve(slicedArray);
    });
  });
}
