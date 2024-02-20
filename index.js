async function main() {
  const res = await fetch("./routedata.json");
  const data = await res.json();

  for (route in data) {
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
    const halte = data[route].datahalte;
    const res = await fetch(data[route].urltrack).catch((error) =>
      console.log(error)
    );
    var bus;
    if (!res) {
      bus = [];
    } else {
      bus = await res.json();
    }
    var counter = document.createElement("p");
    counter.innerHTML = `${bus.length} Bus • ${halte.length || 0} Halte`;
    routedetail.appendChild(counter);
    routecontainer.appendChild(routedetail);
    a.appendChild(routecontainer);
    routelist.appendChild(a);
  }
}
main();
