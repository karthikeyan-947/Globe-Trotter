// Dashboard Page JavaScript
// Loads trips from backend and displays them

document.addEventListener('DOMContentLoaded', async () => {
    const { TripAPI, showToast, formatDate } = window.GlobeTrotterAPI;

    // Get the container for trip cards
    const tripsContainer = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3');
    if (!tripsContainer) return;

    // Load trips from backend
    try {
        const trips = await TripAPI.getAll();

        // Update stats
        updateStats(trips);

        // Clear existing cards except the "Create New Trip" button
        const createButton = tripsContainer.querySelector('button');
        tripsContainer.innerHTML = '';

        // Render trip cards
        trips.forEach(trip => {
            const card = createTripCard(trip);
            tripsContainer.appendChild(card);
        });

        // Add the create button back
        if (createButton) {
            tripsContainer.appendChild(createButton);
        } else {
            tripsContainer.appendChild(createNewTripButton());
        }

        showToast(`Loaded ${trips.length} trips`, 'success');
    } catch (error) {
        showToast('Failed to load trips: ' + error.message, 'error');
    }

    // Handle "Plan New Trip" button click
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Plan New Trip') || btn.textContent.includes('Create New Trip')) {
            btn.addEventListener('click', () => {
                window.location.href = 'create trip.html';
            });
        }
    });
});

function updateStats(trips) {
    // Update total trips count
    const totalTripsEl = document.querySelector('.text-2xl.font-bold');
    if (totalTripsEl && totalTripsEl.closest('.rounded-xl')) {
        totalTripsEl.textContent = trips.length;
    }

    // Count unique cities
    const cities = new Set();
    trips.forEach(trip => {
        if (trip.stops) {
            trip.stops.forEach(stop => cities.add(stop.city));
        }
    });
}

function createTripCard(trip) {
    const card = document.createElement('div');
    card.className = 'group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300';
    card.dataset.tripId = trip.id;

    const stopsCount = trip.stops ? trip.stops.length : 0;
    const formattedDate = trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date not set';

    card.innerHTML = `
    <div class="relative w-full aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
      <div class="w-full h-full flex items-center justify-center">
        <span class="material-symbols-outlined text-6xl text-primary/30">flight_takeoff</span>
      </div>
      <div class="absolute top-3 right-3">
        <span class="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20 backdrop-blur-sm">
          ${stopsCount} Stops
        </span>
      </div>
    </div>
    <div class="flex flex-col gap-1 px-1 pb-2">
      <div class="flex justify-between items-start">
        <h4 class="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">${trip.name}</h4>
        <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 delete-trip-btn" data-trip-id="${trip.id}">
          <span class="material-symbols-outlined text-xl">delete</span>
        </button>
      </div>
      <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
        <span class="material-symbols-outlined text-base">calendar_today</span>
        <span>${formattedDate}</span>
      </div>
      <div class="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
        <span class="text-xs text-slate-400 font-medium">${stopsCount} Cities</span>
        <a class="text-sm font-semibold text-primary hover:underline view-trip-btn cursor-pointer" data-trip-id="${trip.id}">View Details</a>
      </div>
    </div>
  `;

    // Add event listeners
    card.querySelector('.delete-trip-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Delete this trip?')) {
            try {
                await window.GlobeTrotterAPI.TripAPI.delete(trip.id);
                card.remove();
                window.GlobeTrotterAPI.showToast('Trip deleted', 'success');
            } catch (error) {
                window.GlobeTrotterAPI.showToast('Failed to delete: ' + error.message, 'error');
            }
        }
    });

    card.querySelector('.view-trip-btn').addEventListener('click', () => {
        localStorage.setItem('currentTripId', trip.id);
        window.location.href = 'itinerary.html';
    });

    return card;
}

function createNewTripButton() {
    const btn = document.createElement('button');
    btn.className = 'group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 min-h-[300px] hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer text-slate-400 hover:text-primary';
    btn.innerHTML = `
    <div class="rounded-full bg-slate-200 dark:bg-slate-700 p-4 group-hover:bg-primary/20 transition-colors">
      <span class="material-symbols-outlined text-3xl">add</span>
    </div>
    <div class="text-center">
      <p class="text-lg font-bold group-hover:text-primary transition-colors">Create New Trip</p>
      <p class="text-sm text-slate-500">Start planning your next adventure</p>
    </div>
  `;
    btn.addEventListener('click', () => {
        window.location.href = 'create trip.html';
    });
    return btn;
}
