const sseFunc = function(event) {
  const title = document.getElementById("title");

  title.innerHTML = event.data;
};


const evtSource = new EventSource("faggot.fgt");
evtSource.onmessage = sseFunc;

setTimeout(() => {  evtSource.close(); }, 10000);
