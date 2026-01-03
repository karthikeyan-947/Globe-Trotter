// GlobeTrotter API Helper
// Connects frontend to backend API at http://localhost:5000

const API_BASE = 'http://localhost:5000/api';

// ==================== UTILITY ====================
async function apiRequest(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.details || 'API Error');
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== TRIPS ====================
const TripAPI = {
    // Get all trips
    getAll: () => apiRequest('/trip'),

    // Get single trip with stops
    get: (tripId) => apiRequest(`/trip/${tripId}`),

    // Create a new trip
    create: (name, startDate, endDate) => apiRequest('/trip', {
        method: 'POST',
        body: JSON.stringify({ name, start_date: startDate, end_date: endDate })
    }),

    // Update a trip
    update: (tripId, name, startDate, endDate) => apiRequest(`/trip/${tripId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, start_date: startDate, end_date: endDate })
    }),

    // Delete a trip
    delete: (tripId) => apiRequest(`/trip/${tripId}`, { method: 'DELETE' })
};

// ==================== STOPS ====================
const StopAPI = {
    // Add a stop to a trip
    add: (tripId, city, mode, stayDays) => apiRequest(`/trip/${tripId}/stops`, {
        method: 'POST',
        body: JSON.stringify({ city, mode, stay_days: stayDays })
    }),

    // Delete a stop
    delete: (tripId, stopId) => apiRequest(`/trip/${tripId}/stops/${stopId}`, {
        method: 'DELETE'
    })
};

// ==================== MOCK AI DATA (Fallback when Gemini is rate limited) ====================
function getMockEstimation(stops) {
    const baseCosts = {
        flight: { travel: 5000, perDay: 2500 },
        train: { travel: 800, perDay: 1500 },
        bus: { travel: 400, perDay: 1200 }
    };

    let totalCost = 0;
    const legs = [];

    stops.forEach((stop, index) => {
        const mode = stop.mode || 'train';
        const days = stop.stay_days || 1;
        const costs = baseCosts[mode] || baseCosts.train;

        const travelCost = costs.travel;
        const stayCost = costs.perDay * days;
        const legTotal = travelCost + stayCost;
        totalCost += legTotal;

        legs.push({
            from: index === 0 ? 'Starting Point' : stops[index - 1].city,
            to: stop.city,
            mode: mode,
            stayDays: days,
            travelTime: mode === 'flight' ? '2h' : mode === 'train' ? '5h 30m' : '8h',
            travelCost: travelCost,
            stayCost: stayCost,
            legTotal: legTotal
        });
    });

    return {
        tripName: 'Your Trip',
        totalDays: stops.reduce((sum, s) => sum + (s.stay_days || 1), 0),
        totalEstimatedCost: totalCost,
        legs: legs,
        summary: `Multi-city trip covering ${stops.length} destinations with AI-estimated budget`,
        tips: [
            'Book transportation 2 weeks in advance for better prices',
            'Consider local homestays for authentic experiences',
            'Keep ₹500-1000 daily for food and miscellaneous expenses'
        ]
    };
}

function getMockSingleEstimate(from, to, mode, days) {
    const baseCosts = {
        flight: { travel: 5000, perDay: 2500 },
        train: { travel: 800, perDay: 1500 },
        bus: { travel: 400, perDay: 1200 }
    };

    const costs = baseCosts[mode] || baseCosts.train;
    const travelCost = costs.travel;
    const dailyStayCost = costs.perDay;
    const totalStayCost = dailyStayCost * days;

    return {
        travelTime: mode === 'flight' ? '1h 30m' : mode === 'train' ? '5h 30m' : '8h',
        ticketCost: travelCost,
        dailyStayCost: dailyStayCost,
        totalStayCost: totalStayCost,
        totalCost: travelCost + totalStayCost,
        budgetReasoning: `Estimated based on average ${mode} ticket prices and mid-range accommodations in ${to}`,
        assumptions: [
            `Based on current ${mode} fare trends`,
            `Accommodation cost for ${days} nights at mid-range hotels`,
            'Prices are approximate and may vary by season'
        ]
    };
}

// ==================== AI ESTIMATION (with fallback) ====================
const EstimateAPI = {
    // Estimate single trip leg
    single: async (from, to, mode, days) => {
        try {
            return await apiRequest('/trip/estimate', {
                method: 'POST',
                body: JSON.stringify({ from, to, mode, days })
            });
        } catch (error) {
            console.log('Using mock estimation (API rate limited)');
            return getMockSingleEstimate(from, to, mode, days);
        }
    },

    // Estimate full itinerary for a trip (with fallback)
    full: async (tripId) => {
        try {
            return await apiRequest(`/trip/${tripId}/estimate-all`, {
                method: 'POST'
            });
        } catch (error) {
            console.log('Using mock estimation (API rate limited)');
            // Get trip data for mock estimation
            try {
                const trip = await TripAPI.get(tripId);
                if (trip && trip.stops) {
                    const mockData = getMockEstimation(trip.stops);
                    mockData.tripName = trip.name;
                    return mockData;
                }
            } catch (e) { }
            return getMockEstimation([]);
        }
    }
};

// ==================== UI HELPERS ====================
function showLoading(element) {
    if (element) {
        element.disabled = true;
        element.dataset.originalText = element.innerHTML;
        element.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Loading...';
    }
}

function hideLoading(element) {
    if (element && element.dataset.originalText) {
        element.disabled = false;
        element.innerHTML = element.dataset.originalText;
    }
}

function showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500'
    };

    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `toast-notification fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-[9999] flex items-center gap-2`;
    toast.style.animation = 'fadeIn 0.3s ease-out';
    toast.innerHTML = `
    <span class="material-symbols-outlined text-lg">${icons[type]}</span>
    <span>${message}</span>
  `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(20px); }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Export for use in other files
window.GlobeTrotterAPI = {
    TripAPI,
    StopAPI,
    EstimateAPI,
    showLoading,
    hideLoading,
    showToast,
    formatCurrency,
    formatDate
};

console.log('🌍 GlobeTrotter API loaded. Backend:', API_BASE);
