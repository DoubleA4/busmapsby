var datenow = new Date();
var dd = String(datenow.getDate()).padStart(2, "0");
var mm = String(datenow.getMonth() + 1).padStart(2, "0");
var yyyy = datenow.getFullYear();
var datenows = yyyy + "-" + mm + "-" + dd;

async function getJson(URL) {
  var res = await fetch(URL);
  data = await res.json();
  return data;
}

var vw = Math.max(
  document.documentElement.clientWidth || 0,
  window.innerWidth || 0
);

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const routeParams = urlParams.get("route");

const markerZoom = 15;
var routedata;
var haltedata;
var markers = {};
markers.halte = {};

var halteMarkersGroup = new L.FeatureGroup();
var routeLinesGroup = new L.FeatureGroup();
map.createPane("routeLine");
map.getPane("routeLine").style.zIndex = 250;

var uishrink = false;
function shrinkUI() {
  if (!uishrink) {
    document.getElementById("ui").style.transform = "translateY(175px)";
    uishrink = true;
  } else {
    document.getElementById("ui").style.transform = "";
    uishrink = false;
  }
}

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
      markerOption
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
  }, 3000);
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

async function setVehicleMarker(vecRoute, URL) {
  let id_koridor = routedata[vecRoute].code;
  let reqAddr;
  if (id_koridor < 10) {
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
    `https://suroboyobus.surabaya.go.id/gbapi/gobisbaru/track/${reqAddr}/${id_koridor}`,
    options
  );
  const data = await response.json();

  const svgArrow = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 572.71 763.69" class="vehicleMarker"><path d="M277.04 2.58a19.13 19.13 0 0 0-8.35 9.91L1.18 737.78a19.09 19.09 0 0 0 28.09 22.76l257.13-162 257 162.18a19.09 19.09 0 0 0 28.12-22.74l-267-725.5a19.08 19.08 0 0 0-24.51-11.3 17.76 17.76 0 0 0-3 1.39Z" fill-rule="evenodd" fill="${routedata[vecRoute].color}"/></svg>`;

  // const busIcon = L.icon({
  //   iconUrl: "images/location_arrow.svg",
  //   iconAnchor: [10, 10],
  // });

  const busIcon = L.divIcon({
    html: svgArrow,
    className: "divMarker",
    iconAnchor: [10, 10],
  });

  if (routeParams !== "all")
    document.getElementById("buscount").innerHTML = data.length;
  const busdata = document.getElementById("busdata");

  if (!markers[vecRoute]) {
    var vecMarkers = {};
    data.forEach((vehicle) => {
      vecMarkers[vehicle.info] = L.marker([vehicle.lat, vehicle.lng], {
        icon: busIcon,
        rotationAngle: vehicle.direction,
      })
        .addTo(map)
        .bindPopup(
          `<b>${vehicle.info}</b><br><b>Kecepatan :</b> ${vehicle.speed}`
        );
      // L.DomUtil.addClass(markers[counter]._icon, "vehicleMarker");

      if (routeParams !== "all") {
        var busPill = document.createElement("div");
        busPill.className = "busPill";
        busPill.onclick = function () {
          map.closePopup();
          map.setView(vecMarkers[vehicle.info]._latlng, 17);
          vecMarkers[vehicle.info].openPopup();
        };
        var faBus = document.createElement("i");
        faBus.className = "fa fa-bus pillBus";
        faBus.style.color = routedata[vecRoute].color;
        busPill.appendChild(faBus);
        var busName = document.createElement("p");
        busName.innerHTML = vehicle.info;
        busPill.appendChild(busName);
        busdata.appendChild(busPill);
      }
    });
    markers[vecRoute] = vecMarkers;
  } else {
    data.forEach((vehicle) => {
      markers[vecRoute][vehicle.info]
        .setRotationAngle(vehicle.direction)
        .setLatLng([vehicle.lat, vehicle.lng])
        .bindPopup(
          `<b>${vehicle.info}</b><br><b>Kecepatan :</b> ${vehicle.speed}`
        );
    });
  }
  setTimeout(() => {
    setVehicleMarker(vecRoute, URL);
  }, 5000);
}

//place polyline and halte marker on the map
async function routeInitNew(route) {
  var stoplist = document.getElementById("stoplist");

  if (routeParams !== "all") {
    //set page accent color and text color
    document.documentElement.style.setProperty(
      "--accent-color",
      routedata[route].color
    );
    document.documentElement.style.setProperty(
      "--accent-text",
      routedata[route].text
    );
    //set route information
    document.title = `${routedata[route].name} | ${routedata[route].title}`;
    document.getElementById(
      "routename"
    ).innerHTML = `${routedata[route].name} | ${routedata[route].title}`;
    document.getElementById("routehours").innerHTML = routedata[route].hours;
  }

  //draw route polyline on the map
  var routePoly = L.polyline(routedata[route].datarute, {
    color: routedata[route].color,
    opacity: 1,
    weight: 5,
    pane: "routeLine",
  }).addTo(map);
  //add polyline to featureGroup
  routeLinesGroup.addLayer(routePoly);

  //get halte data and set halte counter
  const listhalte = routedata[route].datahalte;
  const haltecount = listhalte.filter(
    (item, index) => listhalte.indexOf(item) === index
  );
  if (routeParams !== "all")
    document.getElementById("haltecount").innerHTML = haltecount.length;

  //add halte to map
  listhalte.forEach((halte, i) => {
    const markerOption = {
      radius: 5,
      color: "#000000",
      weight: 2,
      fillColor: "#FFFFFF",
      fillOpacity: 1,
    };

    const haltenow = haltedata.filter((e) => e.uniqid == halte)[0];

    var transit = [];
    if (routeParams !== "all") {
      transit = haltenow.transit.filter((e) => e !== route);
    } else {
      transit = haltenow.transit;
    }

    var transitPopup = ``;
    if (transit.length > 0) {
      transit.forEach((routename) => {
        const pill = `<a href='./map.html?route=${routename}'><div style='color: ${routedata[routename].text}; background-color: ${routedata[routename].color}' class='transit'>${routedata[routename].name}</div></a>`;
        transitPopup = transitPopup + pill;
      });
    }

    if (!markers.halte[haltenow.uniqid]) {
      markers.halte[haltenow.uniqid] = L.circleMarker(
        [haltenow.lat, haltenow.lon],
        markerOption
      ).bindPopup(
        `
          <div class='haltePopup'>
            <p style='font-weight: 700;'>${haltenow.nama}</p>
            <p>${haltenow.description}</p>
            <p style='font-weight: 700;'>Koneksi:</p>
            <div class='stop'>
              ${transitPopup}
            </div>
            <a href='https://maps.google.com?saddr=Current+Location&daddr=${haltenow.lat},${haltenow.lon}'>
              <div class='navigate'>
                <i class="fa fa-map-marker"></i>
                <p>Navigasi</p>
              </div>
            </a>
          </div>
        `,
        {
          minWidth: 250,
          maxWidth: 280,
        }
      );

      halteMarkersGroup.addLayer(markers.halte[haltenow.uniqid]);
    }

    if (routeParams !== "all") {
      var rectpos = "0";
      if (i === 0) {
        rectpos = "15";
      } else if (i === listhalte.length - 1) {
        rectpos = "-15";
      }

      var stop = document.createElement("div");
      stop.className = "stop";

      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "30");
      svg.setAttribute("height", "30");
      var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", "12");
      rect.setAttribute("y", rectpos);
      rect.setAttribute("width", "6");
      rect.setAttribute("height", "30");
      rect.setAttribute("style", "fill: var(--accent-color);");
      svg.appendChild(rect);
      var circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", "15");
      circle.setAttribute("cy", "15");
      circle.setAttribute("r", "6");
      circle.setAttribute("stroke", "black");
      circle.setAttribute("stroke-width", "2");
      circle.setAttribute("fill", "white");
      svg.appendChild(circle);
      stop.appendChild(svg);

      var text = document.createElement("p");
      text.style = "margin-right: 0.25rem;";
      text.innerHTML = haltenow.nama;
      text.onclick = function () {
        map.addLayer(halteMarkersGroup);
        map.closePopup();
        map.setView(markers.halte[haltenow.uniqid]._latlng, 17);
        markers.halte[haltenow.uniqid].openPopup();
      };
      stop.appendChild(text);

      if (transit.length > 0) {
        transit.forEach((routename) => {
          var button = document.createElement("a");
          button.setAttribute("href", `./map.html?route=${routename}`);
          var transit = document.createElement("div");
          transit.style = `color: ${routedata[routename].text}; background-color: ${routedata[routename].color}`;
          transit.className = "transit";
          transit.innerHTML = routedata[routename].name;
          button.appendChild(transit);
          stop.appendChild(button);
        });
      }

      stoplist.appendChild(stop);
    }
  });
}

async function getData() {
  routedata = await getJson("./routedata.json");
  const gethalte = await getJson("./halte.json");
  haltedata = gethalte.halte;
}

getData().then(async () => {
  // allroute();
  if (routeParams === "all") {
    const trackData = await getJson("https://busmapapi.fly.dev/all");
    document.getElementById("infocontainer").style.display = "none";
    document.getElementById("ui").style.height = "auto";
    if (vw >= 800) {
      document.getElementById("ui").style.width = "auto";
    }
    Object.keys(routedata)
      .slice()
      .reverse()
      .forEach((key) => {
        routeInitNew(key);
        setVehicleMarker(key, trackData[routedata[key].code]);
      })
      .then(() => {
        map.fitBounds(routeLinesGroup.getBounds());
      });
  } else if (routeParams === "sbr1") {
    const trackSBRT = await getJson("https://busmapapi.fly.dev/3");
    const trackURL = await getJson("https://busmapapi.fly.dev/1");
    routeInitNew("sbrt");
    routeInitNew(routeParams).then(() => {
      map.fitBounds(routeLinesGroup.getBounds());
    });
    setVehicleMarker("sbrt", trackSBRT.url);
    setVehicleMarker(routeParams, trackURL.url);
  } else {
    const trackURL = await getJson(
      `https://busmapapi.fly.dev/${routedata[routeParams].code}`
    );
    routeInitNew(routeParams).then(() => {
      map.fitBounds(routeLinesGroup.getBounds());
    });
    setVehicleMarker(routeParams, trackURL.url);
  }
});

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
