// Initialize map
var map = L.map('map').setView([20,0],2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);

// Heatmap layer
var heatLayer = L.heatLayer([], {radius:25, blur:15, maxZoom:10}).addTo(map);

// Counters
var total=0, ddos=0, malware=0, phishing=0;

// Attack types and filters
var attackTypes=["DDoS","Malware","Phishing"];
var showType={DDoS:true,Malware:true,Phishing:true};

// Top countries tracking
var countryCounts={};
var hotZones=[
  [37.77,-122.41],[55.75,37.62],[39.90,116.40],[48.85,2.35],[51.50,-0.12]
];

// Weighted coordinates (hot zones)
function weightedCoord(){
  if(Math.random()<0.6){
    var zone=hotZones[Math.floor(Math.random()*hotZones.length)];
    var lat=zone[0]+Math.random()*2-1;
    var lng=zone[1]+Math.random()*2-1;
    return [lat,lng];
  } else {
    return [Math.random()*140-70, Math.random()*360-180];
  }
}

// Simulate attack arrow with glowing effect
function drawAttack(source,target,type){
  if(!showType[type]) return;

  var color=type=="DDoS"? "#ff0000": type=="Malware"? "#ffa500": "#00ffff";
  var line=L.polyline([source,target],{color:color,weight:2,opacity:0.7}).addTo(map);
  
  var marker=L.circleMarker(source,{
    radius:5,
    color:color,
    fillColor:color,
    fillOpacity:0.9
  }).addTo(map);
  marker.bindTooltip(type,{className:'my-tooltip',permanent:false}).openTooltip();

  // Animate curved path (arc effect)
  var steps=30,step=0;
  var midLat=(source[0]+target[0])/2 +0.5*Math.sin(Math.PI*step/steps);
  var midLng=(source[1]+target[1])/2;
  var latStep=(target[0]-source[0])/steps;
  var lngStep=(target[1]-source[1])/steps;

  var anim=setInterval(function(){
    if(step>=steps){
      clearInterval(anim);
      map.removeLayer(marker);
      map.removeLayer(line);
      return;
    }
    var arcLat=source[0]+latStep*step + 0.5*Math.sin(Math.PI*step/steps);
    var arcLng=source[1]+lngStep*step;
    marker.setLatLng([arcLat,arcLng]);
    step++;
  },80);

  // Heatmap
  heatLayer.addLatLng(target);
}

// Update top countries
function updateTopCountries(lat,lng){
  var key=lat.toFixed(0)+","+lng.toFixed(0);
  countryCounts[key]=(countryCounts[key]||0)+1;
  var sorted=Object.entries(countryCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  var ul=document.getElementById("topCountries");
  ul.innerHTML="";
  sorted.forEach(c=>ul.innerHTML+="<li>"+c[0]+" ("+c[1]+")</li>");
}

// Toggle attack types
function toggleType(type){ showType[type]=!showType[type]; }

// Simulation engine
function simulateAttack(){
  var source=weightedCoord();
  var target=weightedCoord();
  var type=attackTypes[Math.floor(Math.random()*attackTypes.length)];

  drawAttack(source,target,type);

  // Update counters
  total++; if(type=="DDoS") ddos++; if(type=="Malware") malware++; if(type=="Phishing") phishing++;
  document.getElementById("total").innerText=total;
  document.getElementById("ddos").innerText=ddos;
  document.getElementById("malware").innerText=malware;
  document.getElementById("phishing").innerText=phishing;

  updateTopCountries(target[0],target[1]);
}

// Start simulation
setInterval(simulateAttack,600);