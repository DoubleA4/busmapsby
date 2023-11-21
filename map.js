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

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const route = urlParams.get("route");

var routedata;

var markers = {};

async function setVehicle() {
  const response = await fetch(routedata[route].urltrack);
  const data = await response.json();

  const svgArrow = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 572.71 763.69" class="vehicleMarker"><path d="M277.04 2.58a19.13 19.13 0 0 0-8.35 9.91L1.18 737.78a19.09 19.09 0 0 0 28.09 22.76l257.13-162 257 162.18a19.09 19.09 0 0 0 28.12-22.74l-267-725.5a19.08 19.08 0 0 0-24.51-11.3 17.76 17.76 0 0 0-3 1.39Z" fill-rule="evenodd"/></svg>`;

  // const busIcon = L.icon({
  //   iconUrl: "images/location_arrow.svg",
  //   iconAnchor: [10, 10],
  // });

  const busIcon = L.divIcon({
    html: svgArrow,
    className: "divMarker",
    iconAnchor: [10, 10],
  });

  document.getElementById("buscount").innerHTML = data.length;
  const busdata = document.getElementById("busdata");

  if (Object.keys(markers).length === 0) {
    data.forEach((vehicle) => {
      markers[vehicle.info] = L.marker([vehicle.lat, vehicle.lng], {
        icon: busIcon,
        rotationAngle: vehicle.direction,
      })
        .addTo(map)
        .bindPopup(
          `${vehicle.keterangan}<br><b>Kecepatan :</b> ${vehicle.speed}`
        );
      // L.DomUtil.addClass(markers[counter]._icon, "vehicleMarker");

      var busPill = document.createElement("div");
      busPill.className = "busPill";
      busPill.onclick = function () {
        map.closePopup();
        map.flyTo(markers[vehicle.info]._latlng, 17);
        markers[vehicle.info].openPopup();
      };
      var faBus = document.createElement("i");
      faBus.className = "fa fa-bus pillBus";
      busPill.appendChild(faBus);
      var busName = document.createElement("p");
      busName.innerHTML = vehicle.info;
      busPill.appendChild(busName);
      busdata.appendChild(busPill);
    });
  } else {
    data.forEach((vehicle) => {
      markers[vehicle.info]
        .setRotationAngle(vehicle.direction)
        .setLatLng([vehicle.lat, vehicle.lng])
        .bindPopup(
          `${vehicle.keterangan}<br><b>Kecepatan :</b> ${vehicle.speed}`
        );
    });
  }
}

async function routeInit() {
  routedata = await getJson("./routedata.json");
  document.documentElement.style.setProperty(
    "--accent-color",
    routedata[route].color
  );
  document.documentElement.style.setProperty(
    "--accent-text",
    routedata[route].text
  );
  document.title = `${routedata[route].name} | ${routedata[route].title}`;
  document.getElementById("routename").innerHTML = routedata[route].title;
  document.getElementById("routehours").innerHTML = routedata[route].hours;

  // const response = await fetch(
  //   `http://36.66.208.109/gbapi/gobis/init/${routedata[route].code}/1/1/1/${datenows} 00:00:01/${datenows} 00:00:01/${datenows} 00:00:01`
  // );
  // const response = await fetch(
  //   "https://gist.githubusercontent.com/DoubleA4/64618ff3486a1096b05fe37bab512dd9/raw/dea90e66b958f3c929153716c1b167850b8a44c9/R1.json"
  // );
  // const data = await response.json();

  var routePoly = L.polyline(routedata[route].datarute, {
    color: routedata[route].color,
    opacity: 1,
  }).addTo(map);
  map.fitBounds(routePoly.getBounds());

  const datahalte = routedata[route].datahalte;
  document.getElementById("haltecount").innerHTML = datahalte.length;

  var stoplist = document.getElementById("stoplist");

  var shelterMarkers = new L.FeatureGroup();

  datahalte.forEach((halte, i) => {
    const markerOption = {
      radius: 5,
      color: "#000000",
      weight: 2,
      fillColor: "#FFFFFF",
      fillOpacity: 1,
    };

    var transitPopup = ``;
    if (halte.transit.length > 0) {
      halte.transit.forEach((routename) => {
        const pill = `<a href='./map.html?route=${routename}'><div style='color: ${routedata[routename].text}; background-color: ${routedata[routename].color}' class='transit'>${routedata[routename].name}</div></a>`;
        transitPopup = transitPopup + pill;
      });
    }

    var marker = L.circleMarker([halte.lat, halte.lon], markerOption).bindPopup(
      `
        <div class='haltePopup'>
          <p style='font-weight: 700;'>${halte.nama}</p>
          <p>${halte.description}</p>
          <p style='font-weight: 700;'>Koneksi:</p>
          <div class='stop'>
            ${transitPopup}
          </div>
          <a href='https://maps.google.com?saddr=Current+Location&daddr=${halte.lat},${halte.lon}'>
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

    shelterMarkers.addLayer(marker);

    if (map.getZoom() > 15) {
      map.addLayer(shelterMarkers);
    }

    map.on("zoomend", function () {
      if (map.getZoom() < 15) {
        map.removeLayer(shelterMarkers);
      } else {
        map.addLayer(shelterMarkers);
      }
    });

    var rectpos = "0";
    if (i === 0) {
      rectpos = "15";
    } else if (i === datahalte.length - 1) {
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
    text.innerHTML = halte.nama;
    text.onclick = function () {
      map.closePopup();
      map.flyTo([halte.lat, halte.lon], 17);
      marker.openPopup();
    };
    stop.appendChild(text);

    if (halte.transit.length > 0) {
      halte.transit.forEach((routename) => {
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
  });
  setVehicle();
}
routeInit();

setInterval(setVehicle, 5000);
