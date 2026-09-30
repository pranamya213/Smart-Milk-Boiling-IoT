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

function simulateState(state) {
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

    if (state === 'normal') {
        tempValue.textContent = '65°C';
        largeTempValue.textContent = '65°C';
        tempProgress.style.width = '65%';
        tempStatus.textContent = 'Heating Normally';
        
        levelValue.textContent = 'Normal';
        levelStatus.textContent = 'Safe';
        
        gasValue.textContent = 'ON';
        gasValue.style.color = 'var(--text-main)';
        
        safetyCard.className = 'card safety-section safe';
        safetyIcon.textContent = '🟢';
        safetyTitle.textContent = 'SYSTEM SAFE';
        safetyDesc.textContent = 'Monitoring milk boiling conditions';
        
        addAlert('System returning to normal monitoring state', 'info');
    } 
    else if (state === 'warning') {
        tempValue.textContent = '85°C';
        largeTempValue.textContent = '85°C';
        tempProgress.style.width = '85%';
        tempStatus.textContent = 'Approaching Boil';
        
        levelValue.textContent = 'Rising';
        levelStatus.textContent = 'Monitor closely';
        
        gasValue.textContent = 'ON';
        gasValue.style.color = 'var(--text-main)';
        
        safetyCard.className = 'card safety-section warning';
        safetyIcon.textContent = '🟡';
        safetyTitle.textContent = 'ATTENTION';
        safetyDesc.textContent = 'Temperature approaching boiling point';
        
        addAlert('Temperature approaching threshold (85°C)', 'warning');
    }
    else if (state === 'overflow') {
        tempValue.textContent = '95°C';
        largeTempValue.textContent = '95°C';
        tempProgress.style.width = '95%';
        tempStatus.textContent = 'Critical Heat';
        
        levelValue.textContent = 'Overflow Detected!';
        levelStatus.textContent = 'Critical';
        levelValue.style.color = 'var(--accent-red)';
        
        gasValue.textContent = 'OFF';
        gasValue.style.color = 'var(--accent-red)';
        
        safetyCard.className = 'card safety-section critical';
        safetyIcon.textContent = '🔴';
        safetyTitle.textContent = 'ATTENTION REQUIRED';
        safetyDesc.textContent = 'Overflow risk detected. Gas shut off.';
        
        addAlert('Overflow risk detected! Gas/Heater turned OFF.', 'critical');
    }
}
