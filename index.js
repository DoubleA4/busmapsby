async function main() {
  const res = await fetch("./routedata.json");
  const data = await res.json();

  async function counterFill(routeCode) {
    const halte = data[routeCode].datahalte.filter(
      (item, index) => data[routeCode].datahalte.indexOf(item) === index
    );
    const res = await fetch(data[routeCode].urltrack).catch((error) =>
      console.log(error)
    );
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
