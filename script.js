class AnalyticsTracker {
    constructor() {
        // Data load checking from local storage
        const savedData = localStorage.getItem('analyticsData');
        this.data = savedData ? JSON.parse(savedData) : {
            visits: [],
            uniqueVisitors: [],
            dailyStats: {}
        };
        this.init();
    }

    init() {
        this.trackVisit();
        this.updateDashboard();
        this.setupCharts();
        this.generateTrackingCode();
        // Har 5 second mein dashboard update hoga
        setInterval(() => this.updateDashboard(), 5000);
    }

    getVisitorId() {
        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
            visitorId = 'vid_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('visitorId', visitorId);
        }
        return visitorId;
    }

    trackVisit() {
        const now = new Date();
        const visit = {
            id: this.getVisitorId(),
            timestamp: now.toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'direct',
            device: this.getDeviceType(),
            screen: `${window.screen.width}x${window.screen.height}`
        };

        this.data.visits.unshift(visit);
        this.data.visits = this.data.visits.slice(0, 100); // Sirf last 100 visits rakhega

        if (!this.data.uniqueVisitors.includes(visit.id)) {
            this.data.uniqueVisitors.push(visit.id);
        }

        const today = now.toISOString().split('T')[0];
        this.data.dailyStats[today] = (this.data.dailyStats[today] || 0) + 1;

        this.saveData();
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) return 'Mobile';
        if (/tablet/i.test(ua)) return 'Tablet';
        return 'Desktop';
    }

    saveData() {
        localStorage.setItem('analyticsData', JSON.stringify(this.data));
    }

    updateDashboard() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('totalVisits').textContent = this.data.visits.length;
        document.getElementById('uniqueVisitors').textContent = this.data.uniqueVisitors.length;
        document.getElementById('todayVisits').textContent = this.data.dailyStats[today] || 0;
        document.getElementById('bounceRate').textContent = '12%'; // Placeholder

        const list = document.getElementById('visitorsList');
        const recent = this.data.visits.slice(0, 5);
        list.innerHTML = recent.map(v => `
            <div class="visitor-item">
                <span>${v.device} (${v.screen})</span>
                <span>${new Date(v.timestamp).toLocaleTimeString()}</span>
            </div>
        `).join('');
    }

    setupCharts() {
        const ctx = document.getElementById('visitsChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Weekly Visits',
                    data: [10, 25, 15, 30, 20, 40, 35],
                    borderColor: '#667eea',
                    tension: 0.4
                }]
            }
        });

        const dtx = document.getElementById('devicesChart').getContext('2d');
        new Chart(dtx, {
            type: 'doughnut',
            data: {
                labels: ['Desktop', 'Mobile', 'Tablet'],
                datasets: [{
                    data: [50, 40, 10],
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb']
                }]
            }
        });
    }

    generateTrackingCode() {
        const code = `<script src="${window.location.href}script.js"></script>`;
        document.getElementById('trackingCode').value = code;
    }
}

const tracker = new AnalyticsTracker();

function copyTrackingCode() {
    const copyText = document.getElementById("trackingCode");
    copyText.select();
    document.execCommand("copy");
    alert("Code Copied!");
}
