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

L.circle([-7.29357, 112.76111], { radius: 500, interactive: false }).addTo(map);
L.circleMarker([-7.29357, 112.76111], {
  radius: 8,
  fillColor: "white",
  fillOpacity: 1,
  color: "black",
}).addTo(map);
var poiIcon = L.divIcon({
  html: '<div class="poi-icon"><span class="material-icons" style="font-size: 15px">school</span></div>',
  className: "poiMarker",
});
L.marker([-7.293274672400759, 112.76121868291044], { icon: poiIcon }).addTo(
  map
);
var poiIcon = L.divIcon({
  html: '<div class="poi-icon"><span class="material-icons" style="font-size: 15px">park</span></div>',
  className: "poiMarker",
});
L.marker([-7.294312696784273, 112.7617423781772], { icon: poiIcon }).addTo(map);
