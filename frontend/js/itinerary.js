// Itinerary Page JavaScript
// Displays trip details and AI estimations

document.addEventListener('DOMContentLoaded', async () => {
    const { TripAPI, EstimateAPI, showToast, formatCurrency } = window.GlobeTrotterAPI;

    // Get current trip ID from localStorage or URL
    let tripId = localStorage.getItem('currentTripId');
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('id')) {
        tripId = urlParams.get('id');
        localStorage.setItem('currentTripId', tripId);
    }

    if (!tripId) {
        showToast('No trip selected. Redirecting to dashboard...', 'warning');
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
        return;
    }

    try {
        // Load trip data
        const trip = await TripAPI.get(tripId);
        console.log('Loaded trip:', trip);

        // Update page title
        const titleEl = document.querySelector('h1');
        if (titleEl) {
            titleEl.textContent = trip.name;
        }

        // Update date range
        updateDateRange(trip);

        // Update duration and stats
        updateStats(trip);

        // Update quick jump navigation
        updateQuickJump(trip.stops);

        // Update timeline
        updateTimeline(trip);

        showToast(`Loaded "${trip.name}"`, 'success');

        // Get AI estimation (will use fallback if rate limited)
        await getEstimation(tripId, trip);

    } catch (error) {
        showToast('Failed to load trip: ' + error.message, 'error');
        console.error(error);
    }

    // Handle Edit Itinerary button
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Edit')) {
            btn.addEventListener('click', () => {
                window.location.href = 'create%20trip.html';
            });
        }
    });

    // Handle Back to Dashboard
    document.querySelector('a[href="dashboard.html"]')?.addEventListener('click', () => {
        localStorage.removeItem('currentTripId');
    });
});

function updateDateRange(trip) {
    const dateContainer = document.querySelector('.flex.items-center.gap-2.text-slate-500');
    if (dateContainer && trip.start_date) {
        const startDate = new Date(trip.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        const endDate = trip.end_date ? new Date(trip.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '';
        const dateSpan = dateContainer.querySelector('span:nth-of-type(2)');
        if (dateSpan) {
            dateSpan.textContent = endDate ? `${startDate} - ${endDate}` : startDate;
        }
    }
}

function updateStats(trip) {
    if (!trip.stops) return;

    const totalDays = trip.stops.reduce((sum, stop) => sum + (stop.stay_days || 1), 0);
    const travelers = '2'; // Default

    // Update Duration
    const durationEls = document.querySelectorAll('.text-xl.font-bold');
    if (durationEls[0]) {
        durationEls[0].textContent = `${totalDays} Days`;
    }

    // Update travelers
    const travelersSpan = document.querySelector('.flex.items-center.gap-2 span:nth-of-type(4)');
    if (travelersSpan) {
        travelersSpan.textContent = `${travelers} Travelers`;
    }
}

function updateQuickJump(stops) {
    const quickJumpContainer = document.querySelector('.flex.flex-col.gap-2[style*="--radio-dot-svg"]');
    if (!quickJumpContainer || !stops || stops.length === 0) return;

    quickJumpContainer.innerHTML = stops.map((stop, index) => `
    <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group">
      <input ${index === 0 ? 'checked' : ''} class="h-4 w-4 border-2 border-gray-300 dark:border-gray-600 bg-transparent text-transparent checked:border-primary checked:bg-[image:--radio-dot-svg] focus:ring-0 focus:ring-offset-0 checked:focus:border-primary transition-all" name="day-nav" type="radio"/>
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary">Day ${index + 1}: ${stop.city}</span>
        <span class="text-xs text-slate-400">${stop.stay_days || 1} day${(stop.stay_days || 1) > 1 ? 's' : ''} • ${stop.mode || 'train'}</span>
      </div>
    </label>
  `).join('');
}

function updateTimeline(trip) {
    if (!trip.stops || trip.stops.length === 0) return;

    const timelineContainer = document.querySelector('.space-y-8.relative');
    if (!timelineContainer) return;

    // Keep only the first day as template structure is complex
    // Just update the headings
    const dayCards = timelineContainer.querySelectorAll('.relative.pl-0');

    dayCards.forEach((card, index) => {
        if (index < trip.stops.length) {
            const stop = trip.stops[index];
            const nextStop = trip.stops[index + 1];
            const heading = card.querySelector('h3');

            if (heading) {
                if (nextStop) {
                    heading.innerHTML = `Day ${index + 1}: ${stop.city} <span class="text-slate-400 font-normal text-lg">→</span> ${nextStop.city}`;
                } else {
                    heading.textContent = `Day ${index + 1}: ${stop.city}`;
                }
            }
        }
    });
}

async function getEstimation(tripId, trip) {
    const { EstimateAPI, formatCurrency, showToast } = window.GlobeTrotterAPI;

    // Find budget element
    const budgetEls = document.querySelectorAll('.text-xl.font-bold');
    const budgetEl = budgetEls[1]; // Second one is budget

    if (budgetEl) {
        budgetEl.innerHTML = '<span class="animate-pulse">Calculating...</span>';
    }

    try {
        const estimate = await EstimateAPI.full(tripId);
        console.log('AI Estimate:', estimate);

        if (budgetEl && estimate.totalEstimatedCost) {
            budgetEl.textContent = formatCurrency(estimate.totalEstimatedCost);
        }

        // Store for budget page
        localStorage.setItem('currentEstimate', JSON.stringify(estimate));

        showToast('Budget estimated successfully!', 'success');
    } catch (error) {
        console.log('Estimation error:', error.message);
        if (budgetEl) {
            // Use mock data as fallback
            const mockTotal = (trip.stops || []).reduce((sum, stop) => {
                const baseCost = stop.mode === 'flight' ? 5000 : stop.mode === 'bus' ? 400 : 800;
                const dayCost = 1500 * (stop.stay_days || 1);
                return sum + baseCost + dayCost;
            }, 0);
            budgetEl.textContent = formatCurrency(mockTotal || 5000);
        }
    }
}
