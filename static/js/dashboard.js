function updateTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addAlert(message, type) {
    const alertsList = document.getElementById('alerts-list');
    const li = document.createElement('li');
    li.className = `alert-item ${type}`;
    
    let icon = '✓';
    if (type === 'warning') icon = '⚠';
    if (type === 'critical') icon = '🚨';

    li.innerHTML = `<span class="icon">${icon}</span> <span class="time">${updateTime()}</span> ${message}`;
    
    alertsList.insertBefore(li, alertsList.firstChild);
    
    // Keep only last 5 alerts
    if (alertsList.children.length > 5) {
        alertsList.removeChild(alertsList.lastChild);
    }
}

// Global variable to track previous status to trigger alerts on change
let previousStatus = null;
let errorAlertAdded = false;

async function fetchSystemStatus() {
    try {
        const response = await fetch('/api/system-status');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        updateUI(data);
        errorAlertAdded = false;
    } catch (error) {
        console.error("Error fetching system status:", error);
        handleDisconnection();
    }
}

function handleDisconnection() {
    const safetyCard = document.getElementById('safety-card');
    const safetyIcon = document.getElementById('safety-icon');
    const safetyTitle = document.getElementById('safety-title');
    const safetyDesc = document.getElementById('safety-desc');
    
    safetyCard.className = 'card safety-section warning';
    safetyCard.style.borderLeft = '6px solid var(--text-muted)';
    safetyIcon.textContent = '🔌';
    safetyTitle.textContent = 'BACKEND DISCONNECTED';
    safetyDesc.textContent = 'Cannot reach API. Ensure Flask server is running.';
    
    if (!errorAlertAdded) {
        addAlert('Connection to backend lost.', 'warning');
        errorAlertAdded = true;
    }
}

function updateUI(data) {
    const tempValue = document.getElementById('temp-value');
    const largeTempValue = document.getElementById('large-temp-value');
    const tempProgress = document.getElementById('temp-progress');
    const tempStatus = document.getElementById('temp-status');
    
    const levelValue = document.getElementById('level-value');
    const levelStatus = document.getElementById('level-status');
    
    const gasValue = document.getElementById('gas-value');
    
    const safetyCard = document.getElementById('safety-card');
    const safetyIcon = document.getElementById('safety-icon');
    const safetyTitle = document.getElementById('safety-title');
    const safetyDesc = document.getElementById('safety-desc');

    // Restore border if it was changed by disconnection
    safetyCard.style.borderLeft = '';

    // Update Temperature
    const temp = data.temperature;
    tempValue.textContent = `${temp}°C`;
    largeTempValue.textContent = `${temp}°C`;
    
    // Cap progress at 100 for visual consistency
    const progressWidth = Math.min(temp, 100);
    tempProgress.style.width = `${progressWidth}%`;

    // Status logic
    if (data.status === 'Safe') {
        tempStatus.textContent = 'Heating Normally';
        
        levelValue.textContent = data.water_level;
        levelStatus.textContent = 'Safe';
        levelValue.style.color = 'var(--text-main)';
        
        gasValue.textContent = data.gas_heater;
        gasValue.style.color = 'var(--text-main)';
        
        safetyCard.className = 'card safety-section safe';
        safetyIcon.textContent = '🟢';
        safetyTitle.textContent = 'SYSTEM SAFE';
        safetyDesc.textContent = `Monitoring milk boiling conditions. (Buzzer: ${data.buzzer})`;
        
        if (previousStatus !== 'Safe' && previousStatus !== null) {
            addAlert('System returned to safe state.', 'info');
        }
    } else if (data.status === 'Warning') {
        tempStatus.textContent = 'Approaching Boil';
        
        levelValue.textContent = data.water_level;
        levelStatus.textContent = 'Monitor closely';
        levelValue.style.color = 'var(--accent-amber)';
        
        gasValue.textContent = data.gas_heater;
        gasValue.style.color = 'var(--text-main)';
        
        safetyCard.className = 'card safety-section warning';
        safetyIcon.textContent = '🟡';
        safetyTitle.textContent = 'ATTENTION';
        safetyDesc.textContent = `Temperature approaching boiling point. (Buzzer: ${data.buzzer})`;
        
        if (previousStatus !== 'Warning') {
            addAlert(`Temperature approaching threshold (${temp}°C)`, 'warning');
        }
    } else if (data.status === 'Critical') {
        tempStatus.textContent = 'Critical Heat';
        
        levelValue.textContent = data.water_level === 'Overflow' ? 'Overflow Detected!' : data.water_level;
        levelStatus.textContent = 'Critical';
        levelValue.style.color = 'var(--accent-red)';
        
        gasValue.textContent = data.gas_heater;
        gasValue.style.color = 'var(--accent-red)';
        
        safetyCard.className = 'card safety-section critical';
        safetyIcon.textContent = '🔴';
        safetyTitle.textContent = 'ATTENTION REQUIRED';
        safetyDesc.textContent = `Critical risk detected. Gas shut off. (Buzzer: ${data.buzzer})`;
        
        if (previousStatus !== 'Critical') {
            addAlert('Critical risk detected! Gas/Heater turned OFF.', 'critical');
        }
    }
    
    previousStatus = data.status;
}

// Start polling
setInterval(fetchSystemStatus, 2000);
// Initial fetch
fetchSystemStatus();

// Modifying simulateState to send POST requests to the new API
async function simulateState(state) {
    let payload = {};
    if (state === 'normal') {
        payload = { temperature: 65.0, water_level: "Normal" };
    } else if (state === 'warning') {
        payload = { temperature: 86.0, water_level: "High" };
    } else if (state === 'overflow') {
        payload = { temperature: 96.0, water_level: "Overflow" };
    }

    try {
        await fetch('/api/sensor-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        // Trigger an immediate fetch to update the UI right away
        fetchSystemStatus();
    } catch (error) {
        console.error("Simulation failed:", error);
    }
}
