// ============ GEOLOCATION API ============
function getLocation() {
    const resultDiv = document.getElementById('locationResult');
    const errorDiv = document.getElementById('locationError');
    
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    if (!navigator.geolocation) {
        errorDiv.textContent = 'Geolocation is not supported by this browser.';
        errorDiv.classList.remove('hidden');
        return;
    }

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy, altitude } = position.coords;
            
            document.getElementById('latitude').textContent = latitude.toFixed(6);
            document.getElementById('longitude').textContent = longitude.toFixed(6);
            document.getElementById('accuracy').textContent = accuracy.toFixed(0);
            document.getElementById('altitude').textContent = altitude ? altitude.toFixed(0) : 'N/A';
            
            const mapLink = document.getElementById('mapLink');
            mapLink.innerHTML = `<a href="https://maps.google.com/?q=${latitude},${longitude}" target="_blank">View on Google Maps</a>`;
            
            resultDiv.classList.remove('hidden');
        },
        (error) => {
            let message = 'Error getting location: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message += 'Permission denied. Please allow location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'Position unavailable.';
                    break;
                case error.TIMEOUT:
                    message += 'Request timed out.';
                    break;
                default:
                    message += 'Unknown error.';
            }
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        },
        options
    );
}

// ============ BATTERY STATUS API ============
function getBatteryStatus() {
    const resultDiv = document.getElementById('batteryResult');
    const errorDiv = document.getElementById('batteryError');
    
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    if (!navigator.getBattery && !navigator.battery) {
        errorDiv.textContent = 'Battery API is not supported by this browser.';
        errorDiv.classList.remove('hidden');
        return;
    }

    // Try modern API first, fall back to older API
    const batteryPromise = navigator.getBattery ? navigator.getBattery() : Promise.reject();
    
    batteryPromise
        .then((battery) => {
            updateBatteryInfo(battery);
            
            // Listen for battery changes
            battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
            battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
            battery.addEventListener('chargingtimechange', () => updateBatteryInfo(battery));
            battery.addEventListener('dischargingtimechange', () => updateBatteryInfo(battery));
        })
        .catch(() => {
            errorDiv.textContent = 'Battery API is not available on this device.';
            errorDiv.classList.remove('hidden');
        });
}

function updateBatteryInfo(battery) {
    const resultDiv = document.getElementById('batteryResult');
    const level = Math.round(battery.level * 100);
    
    document.getElementById('batteryLevel').textContent = level;
    document.getElementById('charging').textContent = battery.charging ? 'Yes ⚡' : 'No';
    document.getElementById('timeToFull').textContent = battery.chargingTime === Infinity 
        ? 'N/A' 
        : formatTime(battery.chargingTime);
    document.getElementById('timeToEmpty').textContent = battery.dischargingTime === Infinity 
        ? 'N/A' 
        : formatTime(battery.dischargingTime);
    
    const batteryBar = document.getElementById('batteryBar');
    batteryBar.style.width = level + '%';
    
    // Change color based on level
    if (level > 50) {
        batteryBar.style.backgroundColor = '#4CAF50';
    } else if (level > 20) {
        batteryBar.style.backgroundColor = '#FFC107';
    } else {
        batteryBar.style.backgroundColor = '#F44336';
    }
    
    resultDiv.classList.remove('hidden');
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

// ============ VIBRATION API ============
function vibrate(duration) {
    if (!navigator.vibrate) {
        document.getElementById('vibrationStatus').textContent = 'Vibration API is not supported.';
        return;
    }
    navigator.vibrate(duration);
    document.getElementById('vibrationStatus').textContent = `Vibrating for ${duration}ms...`;
    setTimeout(() => {
        document.getElementById('vibrationStatus').textContent = '';
    }, duration + 100);
}

function vibratePattern() {
    if (!navigator.vibrate) {
        document.getElementById('vibrationStatus').textContent = 'Vibration API is not supported.';
        return;
    }
    // Pattern: vibrate 100ms, pause 50ms, vibrate 100ms, pause 50ms, vibrate 200ms
    const pattern = [100, 50, 100, 50, 200];
    navigator.vibrate(pattern);
    document.getElementById('vibrationStatus').textContent = 'Playing vibration pattern...';
}

function stopVibration() {
    navigator.vibrate(0);
    document.getElementById('vibrationStatus').textContent = 'Vibration stopped.';
}

// ============ EVENT LISTENERS ============
document.getElementById('getLocationBtn').addEventListener('click', getLocation);
document.getElementById('getBatteryBtn').addEventListener('click', getBatteryStatus);
document.getElementById('vibrateBtn').addEventListener('click', () => vibrate(100));
document.getElementById('vibrateLongBtn').addEventListener('click', () => vibrate(500));
document.getElementById('vibratePatternBtn').addEventListener('click', vibratePattern);
document.getElementById('stopVibrateBtn').addEventListener('click', stopVibration);

document.getElementById('getAllBtn').addEventListener('click', () => {
    getLocation();
    getBatteryStatus();
    vibrate(50);
});
