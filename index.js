async function getJson(URL) {
  var res = await fetch(URL);
  data = await res.json();
  return data;
}

// Get the modal
var modal = document.getElementById("notifModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

async function main() {
  const res = await fetch("./routedata.json");
  const data = await res.json();
  const trackData = await getJson("https://busmapapi.fly.dev/all");
  const notif = await getJson("https://busmapapi.fly.dev/notification");

  if (notif.pesan.length > 0) {
    var notifContent = document.getElementById("notif-content");
    notifContent.innerHTML = notif.pesan;
    modal.style.display = "block";
    console.log(notif.pesan);
  }

  async function counterFill(routeCode) {
    const haltea = data[routeCode].datahalte.a.filter(
      (item, index) => data[routeCode].datahalte.a.indexOf(item) === index
    );
    const halteb = data[routeCode].datahalte.b.filter(
      (item, index) => data[routeCode].datahalte.b.indexOf(item) === index
    );
    let id_koridor = data[routeCode].code;
    let reqAddr;
    if (id_koridor < 10 || id_koridor == 51) {
      reqAddr = "sbybus";
    } else if (id_koridor < 100) {
      reqAddr = "temanbus";
    } else {
      reqAddr = "feeder";
    }

    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${trackData[id_koridor].split("/")[1]}`,
      },
    };

    const res = await fetch(
      `${trackData.apiUrl}/track/${reqAddr}/${id_koridor}`,
      options
    ).catch((error) => console.log(error));
    var bus;
    if (!res) {
      bus = [];
    } else {
      bus = await res.json();
    }
    var counter = `${bus.length || 0} Bus <br/> ${
      haltea.length + halteb.length || 0
    } Halte`;
    var container = document.getElementById(`counter-${routeCode}`);
    container.innerHTML = counter;
  }

  for (route in data) {
    if (route === "sbrt") {
      continue;
    }
    let pill;
    if (data[route].feeder) {
      pill = `<div style='color: ${data[route].text}; background-color: ${data[route].color}; border: 3px solid ${data[route].color}' class='route-pill feeder-pill menu-pill'>${data[route].name}</div>`;
    } else {
      pill = `<div style='color: ${data[route].text}; background-color: ${data[route].color}; border: 3px solid ${data[route].color}' class='route-pill trunk-pill menu-pill'>${data[route].name}</div>`;
    }
    let routeElement = `<a href="./map.html?route=${route}">
            <div class="routecontainer">
              ${pill}
              <p class="route-name">${data[route].title}</p>
              <p id="counter-${route}" class="route-counter">0 Bus<br/>0 Halte</p>
            </div>
          </a>`;
    $("#routelist").append(routeElement);
    counterFill(route);
  }
}
main();
