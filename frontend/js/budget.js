// Budget Summary Page JavaScript
// Displays trip budget breakdown from AI estimation

document.addEventListener('DOMContentLoaded', async () => {
    const { TripAPI, EstimateAPI, showToast, formatCurrency } = window.GlobeTrotterAPI;

    // Get current trip ID
    const tripId = localStorage.getItem('currentTripId');

    // Check for stored estimate first
    let estimate = null;
    const storedEstimate = localStorage.getItem('currentEstimate');
    if (storedEstimate) {
        try {
            estimate = JSON.parse(storedEstimate);
        } catch (e) { }
    }

    // If no stored estimate and we have a trip, fetch it
    if (!estimate && tripId) {
        try {
            const trip = await TripAPI.get(tripId);
            estimate = await EstimateAPI.full(tripId);
            localStorage.setItem('currentEstimate', JSON.stringify(estimate));
        } catch (error) {
            console.log('Using default data');
        }
    }

    // Update the page with estimate data
    if (estimate) {
        updateBudgetPage(estimate);
        showToast('Budget data loaded', 'success');
    } else {
        // Use default mock data for demo
        const mockEstimate = {
            totalEstimatedCost: 6700,
            legs: [
                { travelCost: 2500, stayCost: 3000 }
            ],
            tips: ['Book in advance', 'Use public transport', 'Try local food']
        };
        updateBudgetPage(mockEstimate);
    }
});

function updateBudgetPage(estimate) {
    const { formatCurrency } = window.GlobeTrotterAPI;

    // Update total cost
    const totalCostEl = document.querySelector('.text-5xl, .text-6xl');
    if (totalCostEl && estimate.totalEstimatedCost) {
        totalCostEl.textContent = formatCurrency(estimate.totalEstimatedCost);
    }

    // Calculate breakdown
    let travelCost = 0;
    let stayCost = 0;

    if (estimate.legs) {
        estimate.legs.forEach(leg => {
            travelCost += leg.travelCost || 0;
            stayCost += leg.stayCost || 0;
        });
    }

    const activitiesCost = estimate.totalEstimatedCost - travelCost - stayCost;

    // Update category costs
    const categoryCards = document.querySelectorAll('.flex.flex-col.gap-4.p-5');
    if (categoryCards[0]) {
        const travelAmount = categoryCards[0].querySelector('.text-2xl.font-bold');
        if (travelAmount) travelAmount.textContent = formatCurrency(travelCost || 2500);
    }
    if (categoryCards[1]) {
        const stayAmount = categoryCards[1].querySelector('.text-2xl.font-bold');
        if (stayAmount) stayAmount.textContent = formatCurrency(stayCost || 3000);
    }
    if (categoryCards[2]) {
        const activityAmount = categoryCards[2].querySelector('.text-2xl.font-bold');
        if (activityAmount) activityAmount.textContent = formatCurrency(activitiesCost > 0 ? activitiesCost : 1200);
    }

    // Update percentage bar
    const total = estimate.totalEstimatedCost || 6700;
    const travelPct = Math.round((travelCost / total) * 100) || 37;
    const stayPct = Math.round((stayCost / total) * 100) || 45;
    const actPct = 100 - travelPct - stayPct;

    const bars = document.querySelectorAll('.flex.h-3.w-full > div');
    if (bars[0]) bars[0].style.width = `${travelPct}%`;
    if (bars[1]) bars[1].style.width = `${stayPct}%`;
    if (bars[2]) bars[2].style.width = `${actPct}%`;

    // Update legend
    const legendItems = document.querySelectorAll('.flex.items-center.gap-2 .text-xs');
    if (legendItems[0]) legendItems[0].textContent = `Travel (${travelPct}%)`;
    if (legendItems[1]) legendItems[1].textContent = `Stay (${stayPct}%)`;
    if (legendItems[2]) legendItems[2].textContent = `Activities (${actPct}%)`;
}
