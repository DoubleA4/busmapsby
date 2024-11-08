async function getJson(URL) {
  var res = await fetch(URL);
  data = await res.json();
  return data;
}

async function main() {
  const res = await fetch("./routedata.json");
  const data = await res.json();
  const trackData = await getJson("https://busmapapi-imu90a.fly.dev/all");

  async function counterFill(routeCode) {
    const halte = data[routeCode].datahalte.filter(
      (item, index) => data[routeCode].datahalte.indexOf(item) === index
    );
    let id_koridor = data[routeCode].code;
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
      headers: {
        Authorization: `Bearer ${trackData[id_koridor].split("/")[1]}`,
      },
    };

    const res = await fetch(
      `https://suroboyobus.surabaya.go.id/gbapi/gobisbaru/track/${reqAddr}/${id_koridor}`,
      options
    ).catch((error) => console.log(error));
    var bus;
    if (!res) {
      bus = [];
    } else {
      bus = await res.json();
    }
    var counter = `${bus.length || 0} Bus • ${halte.length || 0} Halte`;
    var container = document.getElementById(`counter-${routeCode}`);
    container.innerHTML = counter;
  }

  for (route in data) {
    if (route === "sbrt") {
      continue;
    }
    var routelist = document.getElementById("routelist");
    var a = document.createElement("a");
    a.setAttribute("href", `./map.html?route=${route}`);
    var routecontainer = document.createElement("div");
    routecontainer.className = "routecontainer";
    var routecode = document.createElement("div");
    routecode.className = "routecode";
    routecode.style = `background-color: ${data[route].color}; color: ${data[route].text}`;
    routecode.innerHTML = data[route].name;
    routecontainer.appendChild(routecode);
    var routedetail = document.createElement("div");
    routedetail.className = "routedetail";
    var dest = document.createElement("p");
    dest.innerHTML = data[route].title;
    routedetail.appendChild(dest);
    var counter = document.createElement("div");
    counter.id = `counter-${route}`;
    counter.innerHTML = "0 Bus • 0 Halte";
    routedetail.appendChild(counter);
    routecontainer.appendChild(routedetail);
    a.appendChild(routecontainer);
    routelist.appendChild(a);
    counterFill(route);
  }
}
main();
