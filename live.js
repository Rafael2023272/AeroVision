// =====================================================
// CONFIGURATION
// =====================================================
const CONFIG = {
  UPDATE_INTERVAL: 15000,
  DEFAULT_VIEW: [20, 0],
  DEFAULT_ZOOM: 2,
  API_URL: 'https://opensky-network.org/api/states/all'
};

// =====================================================
// STATE MANAGEMENT
// =====================================================
const state = {
  aircraftMarkers: {},
  minAltitude: 1000,
  minSpeed: 0,
  planeCount: 0,
  updateInterval: null
};

// =====================================================
// MAP INITIALIZATION
// =====================================================
let map;

function initializeMap() {
  map = L.map('map', {
    zoomControl: false
  }).setView(CONFIG.DEFAULT_VIEW, CONFIG.DEFAULT_ZOOM);

  // Add zoom control to top-left
  L.control.zoom({ position: 'topleft' }).addTo(map);

  // Dark map tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function createPlaneIcon(heading = 0, speed = 0) {
  const color = speed > 200 ? '#00d4ff' : speed > 100 ? '#4f9eff' : '#94a3b8';
  
  return L.divIcon({
    className: '',
    html: `
      <div style="
        transform: rotate(${heading}deg);
        color: ${color};
        font-size: 20px;
        filter: drop-shadow(0 0 6px ${color});
        transition: all 0.3s ease;
      ">✈</div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

function formatSpeed(speedMs) {
  if (!speedMs) return 'N/A';
  const speedKmh = (speedMs * 3.6).toFixed(0);
  const speedKnots = (speedMs * 1.94384).toFixed(0);
  return `${speedMs.toFixed(0)} m/s (${speedKmh} km/h, ${speedKnots} kts)`;
}

function formatAltitude(altitudeM) {
  if (!altitudeM) return 'N/A';
  const altitudeFt = (altitudeM * 3.28084).toFixed(0);
  return `${altitudeM.toFixed(0)} m (${altitudeFt} ft)`;
}

function createPopupContent(aircraft) {
  return `
    <div class="popup-content">
      <div class="popup-header">
        <span class="popup-icon">✈️</span>
        <span class="popup-callsign">${aircraft.callsign}</span>
      </div>
      <div class="popup-details">
        <div class="popup-row">
          <span class="popup-label">Altitude</span>
          <span class="popup-value">${formatAltitude(aircraft.altitude)}</span>
        </div>
        <div class="popup-row">
          <span class="popup-label">Speed</span>
          <span class="popup-value">${formatSpeed(aircraft.speed)}</span>
        </div>
        <div class="popup-row">
          <span class="popup-label">Heading</span>
          <span class="popup-value">${aircraft.heading}°</span>
        </div>
        <div class="popup-row">
          <span class="popup-label">Origin Country</span>
          <span class="popup-value">${aircraft.country}</span>
        </div>
      </div>
    </div>
  `;
}

// =====================================================
// DATA FETCHING & RENDERING
// =====================================================
async function loadAircraftData() {
  showLoading(true);
  
  try {
    const response = await fetch(CONFIG.API_URL);
    const data = await response.json();
    
    if (!data.states) {
      console.warn('No aircraft data received');
      showLoading(false);
      return;
    }

    const bounds = map.getBounds();
    const newIcaoSet = new Set();
    let visibleCount = 0;

    data.states.forEach(planeData => {
      const aircraft = parseAircraftData(planeData);
      
      if (!isValidAircraft(aircraft)) return;
      if (!meetsFilterCriteria(aircraft)) return;
      if (!bounds.contains([aircraft.lat, aircraft.lon])) return;

      newIcaoSet.add(aircraft.icao);
      visibleCount++;

      updateOrCreateMarker(aircraft);
    });

    removeStaleMarkers(newIcaoSet);
    updateStats(visibleCount);
    
  } catch (error) {
    console.error('Error loading aircraft data:', error);
  } finally {
    showLoading(false);
  }
}

function parseAircraftData(data) {
  return {
    icao: data[0],
    callsign: (data[1] || 'Unknown').trim(),
    country: data[2] || 'Unknown',
    lat: data[6],
    lon: data[5],
    altitude: data[7] || 0,
    speed: data[9] || 0,
    heading: data[10] || 0
  };
}

function isValidAircraft(aircraft) {
  return aircraft.lat && aircraft.lon;
}

function meetsFilterCriteria(aircraft) {
  if (aircraft.altitude < state.minAltitude) return false;
  if (aircraft.speed < state.minSpeed) return false;
  return true;
}

function updateOrCreateMarker(aircraft) {
  if (state.aircraftMarkers[aircraft.icao]) {
    // Update existing marker
    const marker = state.aircraftMarkers[aircraft.icao];
    marker.setLatLng([aircraft.lat, aircraft.lon]);
    marker.setIcon(createPlaneIcon(aircraft.heading, aircraft.speed));
  } else {
    // Create new marker
    const marker = L.marker([aircraft.lat, aircraft.lon], {
      icon: createPlaneIcon(aircraft.heading, aircraft.speed)
    }).addTo(map);

    marker.bindPopup(createPopupContent(aircraft), {
      maxWidth: 300,
      className: 'custom-popup'
    });

    state.aircraftMarkers[aircraft.icao] = marker;
  }
}

function removeStaleMarkers(activeIcaoSet) {
  Object.keys(state.aircraftMarkers).forEach(icao => {
    if (!activeIcaoSet.has(icao)) {
      map.removeLayer(state.aircraftMarkers[icao]);
      delete state.aircraftMarkers[icao];
    }
  });
}

// =====================================================
// UI UPDATES
// =====================================================
function updateStats(count) {
  state.planeCount = count;
  document.getElementById('planeCount').textContent = count;
  
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  document.getElementById('updateTime').textContent = timeString;
}

function showLoading(show) {
  const indicator = document.getElementById('loadingIndicator');
  if (indicator) {
    indicator.classList.toggle('active', show);
  }
}

// =====================================================
// CONTROLS & INTERACTIONS
// =====================================================
function setupControls() {
  // Altitude slider
  const altSlider = document.getElementById('altSlider');
  const altValue = document.getElementById('altValue');
  const altFill = document.getElementById('altFill');

  if (altSlider) {
    altSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      state.minAltitude = Number(value);
      altValue.textContent = value;
      altFill.style.width = `${(value / 10000) * 100}%`;
      loadAircraftData();
    });
  }

  // Speed slider
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  const speedFill = document.getElementById('speedFill');

  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      state.minSpeed = Number(value);
      speedValue.textContent = value;
      speedFill.style.width = `${(value / 300) * 100}%`;
      loadAircraftData();
    });
  }

  // Map event listener for data refresh on move/zoom
  map.on('moveend', () => {
    loadAircraftData();
  });
}

// =====================================================
// GLOBAL FUNCTIONS (called from HTML)
// =====================================================
function refreshData() {
  loadAircraftData();
}

function resetView() {
  map.setView(CONFIG.DEFAULT_VIEW, CONFIG.DEFAULT_ZOOM);
}

// =====================================================
// INITIALIZATION
// =====================================================
function initialize() {
  initializeMap();
  setupControls();
  loadAircraftData();
  
  // Set up periodic updates
  state.updateInterval = setInterval(loadAircraftData, CONFIG.UPDATE_INTERVAL);
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (state.updateInterval) {
    clearInterval(state.updateInterval);
  }
});