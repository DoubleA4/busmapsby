// setting up the map
var map = L.map("map", {
  attributionControl: false,
  zoomControl: false,
}).setView([-7.3026644, 112.7243344], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  className: "map-tiles",
}).addTo(map);

L.control
  .attribution({
    position: "bottomleft",
  })
  .addTo(map);

// add zoom control if desktop
if (!L.Browser.mobile) {
  L.control
    .zoom({
      position: "topright",
    })
    .addTo(map);
}

// useful functions
function getData(url) {
  var result = null;
  $.ajax({
    async: false,
    url: url,
    success: function (data) {
      result = data;
    },
  });
  return result;
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// getting URL params
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const routeParams = urlParams.get("route");

// markers settings and variables
const markerZoom = 15;
var halteMarkersGroup = new L.FeatureGroup();
var routeLinesGroup = new L.FeatureGroup();
const markers = {};
markers.halte = {};

const dataHalte = getData("./halte.json").halte;
const dataRute = getData("./routedata.json");
const dataTracking = getData("https://busmapapi.fly.dev/all");
const dataBoyorail = getData("./boyorail.json");

var route;

// setting route information and themes
// if (routeParams != "all") {
//   route = dataRute[routeParams];
//   let routeTitle = `${route.name} | ${route.title}`;
//   document.title = routeTitle;
//   $("#route-name").text(routeTitle);
//   $("#op-hour").text(route.hours);

//   $(":root")
//     .get(0)
//     .style.setProperty(
//       "--accent-color",
//       `${hexToRgb(route.color).r}, ${hexToRgb(route.color).g}, ${
//         hexToRgb(route.color).b
//       }`
//     );
//   if (routeParams == "sbr1") {
//     setRoute(dataRute.sbrt);
//     setVehicleMarker(dataRute.sbrt, dataTracking[dataRute.sbrt.code]);
//   }
//   setRoute(route);
//   setStopList(route, "a");
//   setVehicleMarker(route, dataTracking[route.code]);
// } else {
//   document.title = "Peta jaringan bus Surabaya";
//   $("#nav-title").text("Semua Rute");
//   $("#route-panel, #map, #location-button").addClass("full-map");
//   setTimeout(map.invalidateSize(), 100);
//   Object.keys(dataRute)
//     .slice()
//     .reverse()
//     .forEach((key) => {
//       let route = dataRute[key];
//       setRoute(route);
//       setVehicleMarker(route, dataTracking[route.code]);
//     });
// }

polylineData = dataBoyorail.features[0].geometry.coordinates.map((coord) => {
  return [coord[1], coord[0]];
});
dataBoyorail.features.shift();

const boyorail = {
  name: "BT",
  title: "Kejawan - Lidah Kulon",
  color: "#86c232",
  text: "white",
  hours: "05:30 - 21:00",
  datarute: polylineData,
  datahalte: dataBoyorail.features,
};

const vehicles = [
  {
    type: "Feature",
    properties: {
      info: "BT-01",
      speed: "40 km/h",
      direction: 80,
    },
    geometry: {
      coordinates: [112.79347248387654, -7.275593021344733],
      type: "Point",
    },
  },
  {
    type: "Feature",
    properties: {
      info: "BT-02",
      speed: "40 km/h",
      direction: -90,
    },
    geometry: {
      coordinates: [112.6687595605926, -7.298489291057109],
      type: "Point",
    },
  },
  {
    type: "Feature",
    properties: {
      info: "BT-03",
      speed: "40 km/h",
      direction: 105,
    },
    geometry: {
      coordinates: [112.70018786893252, -7.286218062787427],
      type: "Point",
    },
  },
  {
    type: "Feature",
    properties: {
      info: "BT-04",
      speed: "40 km/h",
      direction: 90,
    },
    geometry: {
      coordinates: [112.76238987379287, -7.265898189480723],
      type: "Point",
    },
  },
  {
    type: "Feature",
    properties: {
      info: "BT-05",
      speed: "40 km/h",
      direction: -50,
    },
    geometry: {
      coordinates: [112.73336334687951, -7.295611290018115],
      type: "Point",
    },
  },
  {
    type: "Feature",
    properties: {
      info: "BT-06",
      speed: "40 km/h",
      direction: -35,
    },
    geometry: {
      coordinates: [112.74574981665427, -7.27995676764769],
      type: "Point",
    },
  },
  {
    type: "Feature",
    properties: {
      info: "BT-07",
      speed: "40 km/h",
      direction: 105,
    },
    geometry: {
      coordinates: [112.69770364798313, -7.285665177533772],
      type: "Point",
    },
  },
  {
    type: "Feature",
    properties: {
      info: "BT-08",
      speed: "40 km/h",
      direction: -75,
    },
    geometry: {
      coordinates: [112.77376515801421, -7.268486646118191],
      type: "Point",
    },
  },
];

const routeColor = boyorail.color;
let routeTitle = `${boyorail.name} | ${boyorail.title}`;
document.title = routeTitle;
$("#route-name").text(routeTitle);
$("#op-hour").text(boyorail.hours);

$(":root")
  .get(0)
  .style.setProperty(
    "--accent-color",
    `${hexToRgb(routeColor).r}, ${hexToRgb(routeColor).g}, ${hexToRgb(routeColor).b}`,
  );

setRoute(boyorail);

setStopList(boyorail);

const pill = `<div style='color: ${boyorail.text}; background-color: ${boyorail.color}; border: 2px solid ${boyorail.color}; width: 1.3em;' class='route-pill trunk-pill'>${boyorail.name}</div>`;

const busIcon = L.divIcon({
  iconAnchor: [12, 12],
  html: `<span class="material-icons" style="color: ${boyorail.color}">navigation</span>`,
  className: "divMarker",
});

var vecMarkers = {};
vehicles.forEach((vehicle) => {
  vecMarkers[vehicle.properties.info] = L.marker(
    [vehicle.geometry.coordinates[1], vehicle.geometry.coordinates[0]],
    {
      icon: busIcon,
      rotationAngle: vehicle.properties.direction,
    },
  )
    .addTo(map)
    .bindPopup(
      `${pill}<b>${vehicle.properties.info}</b><br><b>Kecepatan :</b> ${vehicle.properties.speed}`,
    );
});
markers[boyorail.name] = vecMarkers;

$("#op-detail").text(
  `${vehicles.length} Kereta | ${boyorail.datahalte.length} Stasiun`,
);

function setRoute(route) {
  // adding route polyline to map
  let routePoly = new L.Polyline(route.datarute, {
    color: route.color,
    weight: 5,
    smoothFactor: 1,
  });
  routePoly.addTo(map);
  routeLinesGroup.addLayer(routePoly);
  map.fitBounds(routeLinesGroup.getBounds());

  // putting every halte on the route to the map
  let count = 0;
  route.datahalte.forEach((currentHalte) => {
    // let currentHalte = dataHalte.filter((halte) => {
    //   return halte.uniqid == halteID;
    // })[0];
    halteID = currentHalte.properties.name.replace(/\s/g, "-").toLowerCase();

    // var currentTransit;
    // if (routeParams != "all") {
    //   currentTransit = currentHalte.transit.filter((route) => {
    //     return route != routeParams;
    //   });
    // } else {
    //   currentTransit = currentHalte.transit;
    // }

    let transitDivs = "";
    // if (currentTransit.length > 0) {
    //   currentTransit.forEach((routename) => {
    //     let pill;
    //     if (dataRute[routename].feeder) {
    //       pill = `<a href='./map.html?route=${routename}'><div style='color: ${dataRute[routename].text}; background-color: ${dataRute[routename].color}; border: 2px solid ${dataRute[routename].color}' class='route-pill feeder-pill'>${dataRute[routename].name}</div></a>`;
    //     } else {
    //       pill = `<a href='./map.html?route=${routename}'><div style='color: ${dataRute[routename].text}; background-color: ${dataRute[routename].color}; border: 2px solid ${dataRute[routename].color}' class='route-pill trunk-pill'>${dataRute[routename].name}</div></a>`;
    //     }
    //     transitDivs += pill;
    //   });
    // }

    // adding halte markers to map
    if (!markers.halte[halteID]) {
      markers.halte[halteID] = new L.circleMarker(
        {
          lat: currentHalte.geometry.coordinates[1],
          lng: currentHalte.geometry.coordinates[0],
        },
        {
          radius: 8,
          fillColor: "white",
          fillOpacity: 1,
          color: "black",
        },
      ).bindPopup(
        `
            <p class='stop-name'>${currentHalte.properties.name}</p>
            <div class='transit-list'>
              ${transitDivs}
            </div>
            <a href='https://maps.google.com?saddr=Current+Location&daddr=${currentHalte.geometry.coordinates[1]},${currentHalte.geometry.coordinates[0]}'>
              <div class='navigate'>
                <span class="material-icons">
                place
                </span>
                <p>Navigasi</p>
              </div>
            </a>
            `,
        {
          minWidth: 250,
          maxWidth: 280,
          className: "halte-popup",
        },
      );
      halteMarkersGroup.addLayer(markers.halte[halteID]);
    }

    // adding halte divs to UI
    // if (routeParams != "all") {
    //   let halteElement = `<div id="halte-${currentHalte.uniqid}" class="route-stop">
    //   <div class="halte-circle"></div>
    //   <p class="stop-name button" onclick="popupHandler('${halteID}')">${currentHalte.nama}</p>
    //   ${transitDivs}
    // </div>`;
    //   $("#stops-container").append(halteElement);
    //   $(".halte-line").height($(".halte-line").height() + 50);
    // }
  });
  // if (routeParams != "all" && route.code != 3) addStopList(route);
}

function setStopList(route) {
  route.datahalte.forEach((currentHalte) => {
    let halteID = currentHalte.properties.name
      .replace(/\s/g, "-")
      .toLowerCase();
    // let currentHalte = dataHalte.filter((halte) => {
    //   return halte.uniqid == halteID;
    // })[0];

    // var currentTransit = currentHalte.transit.filter((route) => {
    //   return route != routeParams;
    // });

    let transitDivs = "";
    // if (currentTransit.length > 0) {
    //   currentTransit.forEach((routename) => {
    //     let pill;
    //     if (dataRute[routename].feeder) {
    //       pill = `<a href='./map.html?route=${routename}'><div style='color: ${dataRute[routename].text}; background-color: ${dataRute[routename].color}; border: 2px solid ${dataRute[routename].color}' class='route-pill feeder-pill'>${dataRute[routename].name}</div></a>`;
    //     } else {
    //       pill = `<a href='./map.html?route=${routename}'><div style='color: ${dataRute[routename].text}; background-color: ${dataRute[routename].color}; border: 2px solid ${dataRute[routename].color}' class='route-pill trunk-pill'>${dataRute[routename].name}</div></a>`;
    //     }
    //     transitDivs += pill;
    //   });
    // }

    let halteElement = `<div id="halte-${halteID}" class="route-stop">
      <div class="halte-circle"></div>
      <p class="stop-name button" onclick="popupHandler('${halteID}')">${currentHalte.properties.name}</p>
      ${transitDivs}
    </div>`;
    $("#stops-container").append(halteElement);
    $(".halte-line").height($(".halte-line").height() + 50);
  });
  $(".halte-line").height($(".halte-line").height() - 35);
  $(".halte-line").css("margin-top", "6em");
}

async function setVehicleMarker(route, URL) {
  let id_koridor = route.code;
  let reqAddr;
  if (id_koridor < 10 || id_koridor == 51 || id_koridor == 12) {
    reqAddr = "sbybus";
  } else if (id_koridor < 100) {
    reqAddr = "temanbus";
  } else {
    reqAddr = "feeder";
  }

  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${URL.split("/")[1]}` },
  };

  const response = await fetch(
    `${dataTracking.apiUrl}/track/${reqAddr}/${id_koridor}`,
    options,
  );
  const data = await response.json();

  let pill;
  if (route.feeder) {
    pill = `<a href='./map.html?route=${route.link}'><div style='color: ${route.text}; background-color: ${route.color}; border: 2px solid ${route.color}' class='route-pill feeder-pill'>${route.name}</div></a>`;
  } else {
    pill = `<a href='./map.html?route=${route.link}'><div style='color: ${route.text}; background-color: ${route.color}; border: 2px solid ${route.color}' class='route-pill trunk-pill'>${route.name}</div></a>`;
  }

  const busIcon = L.divIcon({
    iconAnchor: [12, 12],
    html: `<span class="material-icons" style="color: ${route.color}">navigation</span>`,
    className: "divMarker",
  });

  if (routeParams != "all" && route.code != 3) {
    $("#op-detail").text(
      `${data.length} Bus | ${
        route.datahalte.a.length + route.datahalte.b.length
      } Halte`,
    );
  }

  if (!markers[route.code]) {
    var vecMarkers = {};
    data.forEach((vehicle) => {
      vecMarkers[vehicle.info] = L.marker([vehicle.lat, vehicle.lng], {
        icon: busIcon,
        rotationAngle: vehicle.direction,
      })
        .addTo(map)
        .bindPopup(
          `${pill}<b>${vehicle.info}</b><br><b>Kecepatan :</b> ${vehicle.speed}`,
        );
    });
    markers[route.code] = vecMarkers;
  } else {
    data.forEach((vehicle) => {
      markers[route.code][vehicle.info]
        .setRotationAngle(vehicle.direction)
        .setLatLng([vehicle.lat, vehicle.lng])
        .bindPopup(
          `${pill}<b>${vehicle.info}</b><br><b>Kecepatan :</b> ${vehicle.speed}`,
        );
    });
  }
  setTimeout(() => {
    setVehicleMarker(route, URL);
  }, 5000);
}

// hide and show markers on zoom changes
if (map.getZoom() > markerZoom) {
  map.addLayer(halteMarkersGroup);
}

map.on("zoomend", function () {
  if (map.getZoom() < markerZoom) {
    map.removeLayer(halteMarkersGroup);
  } else {
    map.addLayer(halteMarkersGroup);
  }
});

// handle halte divs popup trigger
function popupHandler(halteID) {
  map.addLayer(halteMarkersGroup);
  map.closePopup();
  map.setView(markers.halte[halteID]._latlng, 17, { pan: { duration: 0.25 } });
  setTimeout(() => {
    markers.halte[halteID].openPopup();
  }, 250);
}

// handle locations and stuff
function getLocation() {
  if (!markers.gps) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      Toastify({
        text: "Geolocation is not supported by this browser.",
        style: {
          backgroud: "#FF0000",
        },
      }).showToast();
    }
  } else {
    map.setView(markers.gps._latlng, 17);
  }
}

function updatePosition() {
  navigator.geolocation.getCurrentPosition(showPosition, showError);
}

function showPosition(position) {
  const markerOption = {
    radius: 7,
    color: "#FFFFFF",
    weight: 3,
    fillColor: "#4285f4",
    fillOpacity: 1,
  };

  if (!markers.gps) {
    markers.gps = L.circleMarker(
      [position.coords.latitude, position.coords.longitude],
      markerOption,
    ).addTo(map);
    map.setView(markers.gps._latlng, 17);
  } else {
    markers.gps.setLatLng([
      position.coords.latitude,
      position.coords.longitude,
    ]);
  }

  setTimeout(() => {
    updatePosition();
  }, 5000);
}

function showError(error) {
  const color = "#FF0000";
  switch (error.code) {
    case error.PERMISSION_DENIED:
      Toastify({
        text: "User denied the request for Geolocation.",
        style: {
          background: color,
        },
      }).showToast();
      break;
    case error.POSITION_UNAVAILABLE:
      Toastify({
        text: "Location information is unavailable.",
        style: {
          backgroud: color,
        },
      }).showToast();
      break;
    case error.TIMEOUT:
      Toastify({
        text: "The request to get user location timed out.",
        style: {
          backgroud: color,
        },
      }).showToast();
      break;
    case error.UNKNOWN_ERROR:
      Toastify({
        text: "An unknown error occurred.",
        style: {
          backgroud: color,
        },
      }).showToast();
      break;
  }
}

function routeSelect(direction) {
  $("div[id^='halte-']").remove();
  $(".halte-line").height(0);
  let opposite;
  if (direction == "a") {
    opposite = "b";
  } else {
    opposite = "a";
  }
  $("#route-" + opposite).removeClass("route-active");
  $("#route-" + direction).addClass("route-active");
  setStopList(route, direction);
}
