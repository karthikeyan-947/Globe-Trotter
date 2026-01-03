// Create Trip Page JavaScript - FULLY FUNCTIONAL
// All buttons work: Delete stops, Mode selection, Add stop, Cancel, Create Itinerary

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Create Trip JS Loaded');

    const { TripAPI, StopAPI, showToast, showLoading, hideLoading } = window.GlobeTrotterAPI;

    // Initialize all stop card functionality
    initializeStopCards();

    // Handle "Add Another Stop" button
    const addStopBtn = document.querySelector('button:has(span.material-symbols-outlined:first-child)');
    const addStopButtons = document.querySelectorAll('button');
    addStopButtons.forEach(btn => {
        if (btn.textContent.includes('Add Another Stop')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                addNewStop();
                showToast('Stop added!', 'success');
            });
        }
    });

    // Handle Cancel button
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.trim() === 'Cancel') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Discard this trip and go back to dashboard?')) {
                    window.location.href = 'dashboard.html';
                }
            });
        }
    });

    // Handle Create Itinerary button
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Create Itinerary')) {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                await createTrip(btn);
            });
        }
    });

    console.log('✅ All buttons initialized');
});

// Initialize all stop card functionality
function initializeStopCards() {
    const stopCards = document.querySelectorAll('.group.flex.gap-4.relative.pb-10');

    stopCards.forEach((card, index) => {
        // Handle delete button
        const deleteBtn = card.querySelector('button:has(span.material-symbols-outlined)');
        if (deleteBtn && deleteBtn.querySelector('span')?.textContent === 'delete') {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteStop(card);
            });
        }

        // Handle mode selection buttons
        const modeButtons = card.querySelectorAll('.grid.grid-cols-3 button');
        modeButtons.forEach(modeBtn => {
            modeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                selectMode(modeBtn, modeButtons);
            });
        });
    });
}

// Select travel mode
function selectMode(selectedBtn, allButtons) {
    // Deselect all
    allButtons.forEach(btn => {
        btn.classList.remove('border-primary', 'bg-primary/5', 'text-primary');
        btn.classList.add('border-slate-200', 'dark:border-slate-600', 'bg-white', 'dark:bg-slate-900', 'text-slate-500', 'dark:text-slate-400');
    });

    // Select clicked button
    selectedBtn.classList.remove('border-slate-200', 'dark:border-slate-600', 'bg-white', 'dark:bg-slate-900', 'text-slate-500', 'dark:text-slate-400');
    selectedBtn.classList.add('border-primary', 'bg-primary/5', 'text-primary');

    console.log('Mode selected:', selectedBtn.textContent.trim());
}

// Delete a stop
function deleteStop(card) {
    const allCards = document.querySelectorAll('.group.flex.gap-4.relative.pb-10');

    if (allCards.length <= 1) {
        window.GlobeTrotterAPI.showToast('Cannot delete the last stop!', 'warning');
        return;
    }

    // Animate and remove
    card.style.transition = 'all 0.3s ease-out';
    card.style.opacity = '0';
    card.style.transform = 'translateX(-50px)';

    setTimeout(() => {
        card.remove();
        updateStopNumbers();
        window.GlobeTrotterAPI.showToast('Stop removed', 'success');
    }, 300);
}

// Update stop numbers after deletion
function updateStopNumbers() {
    const stopCards = document.querySelectorAll('.group.flex.gap-4.relative.pb-10');

    stopCards.forEach((card, index) => {
        // Update number badge
        const numberBadge = card.querySelector('.size-8.rounded-full');
        if (numberBadge) {
            numberBadge.textContent = index + 1;
            if (index === 0) {
                numberBadge.className = 'size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20 z-10 ring-4 ring-background-light dark:ring-background-dark';
            }
        }

        // Update title
        const title = card.querySelector('h3');
        if (title) {
            title.innerHTML = `<span class="material-symbols-outlined text-${index === 0 ? 'primary' : 'slate-400'}">location_city</span> Stop ${index + 1}`;
        }
    });

    // Update counter
    const counter = document.querySelector('.text-xs.font-semibold.bg-slate-200');
    if (counter) {
        counter.textContent = `${stopCards.length} stops added`;
    }
}

// Add a new stop
function addNewStop() {
    const stopsContainer = document.querySelector('.relative.pl-4.md\\:pl-0');
    const addBtnContainer = stopsContainer?.querySelector('.flex.gap-4.relative:not(.pb-10)');

    if (!addBtnContainer) {
        console.error('Could not find add button container');
        return;
    }

    const stopCount = document.querySelectorAll('.group.flex.gap-4.relative.pb-10').length + 1;

    const newStopHTML = `
    <div class="group flex gap-4 md:gap-6 relative pb-10" style="animation: fadeIn 0.3s ease-out">
      <div class="flex flex-col items-center absolute -left-5 md:static h-full">
        <div class="size-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-sm shadow-sm z-10 ring-4 ring-background-light dark:ring-background-dark">${stopCount}</div>
        <div class="w-0.5 bg-slate-200 dark:bg-slate-700 h-full -my-2 group-last:bg-transparent"></div>
      </div>
      <div class="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 md:p-6 transition-all hover:shadow-md hover:border-primary/40 group/card">
        <div class="flex justify-between items-start mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <h3 class="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-slate-400">location_city</span>
            Stop ${stopCount}
          </h3>
          <button class="delete-stop-btn text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
            <span class="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="md:col-span-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">City Name</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-3 text-slate-400">location_on</span>
              <input class="city-input w-full pl-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="Enter city name..." type="text"/>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Travel Mode</label>
            <div class="grid grid-cols-3 gap-2 mode-buttons">
              <button class="mode-btn flex flex-col items-center justify-center gap-1 p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-500 hover:border-primary hover:text-primary transition-all" type="button" data-mode="flight">
                <span class="material-symbols-outlined text-xl">flight</span>
                <span class="text-[10px] font-bold uppercase">Flight</span>
              </button>
              <button class="mode-btn flex flex-col items-center justify-center gap-1 p-2 rounded-lg border border-primary bg-primary/5 text-primary transition-all" type="button" data-mode="train">
                <span class="material-symbols-outlined text-xl">train</span>
                <span class="text-[10px] font-bold uppercase">Train</span>
              </button>
              <button class="mode-btn flex flex-col items-center justify-center gap-1 p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-500 hover:border-primary hover:text-primary transition-all" type="button" data-mode="bus">
                <span class="material-symbols-outlined text-xl">directions_bus</span>
                <span class="text-[10px] font-bold uppercase">Bus</span>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Stay Duration</label>
            <div class="relative">
              <input class="days-input w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white h-11 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="1" type="number" value="2" min="1"/>
              <span class="absolute right-4 top-3 text-slate-400 text-xs font-semibold uppercase">Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    addBtnContainer.insertAdjacentHTML('beforebegin', newStopHTML);

    // Add event listeners to new stop
    const newCard = addBtnContainer.previousElementSibling;

    // Delete button
    newCard.querySelector('.delete-stop-btn').addEventListener('click', (e) => {
        e.preventDefault();
        deleteStop(newCard);
    });

    // Mode buttons
    const modeButtons = newCard.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            selectMode(btn, modeButtons);
        });
    });

    // Update counter
    updateStopNumbers();

    // Focus on city input
    newCard.querySelector('.city-input')?.focus();
}

// Get selected mode from a stop card
function getSelectedMode(card) {
    const selectedBtn = card.querySelector('.mode-btn.border-primary, button.border-primary');
    if (selectedBtn) {
        const icon = selectedBtn.querySelector('.material-symbols-outlined')?.textContent;
        if (icon === 'flight') return 'flight';
        if (icon === 'train') return 'train';
        if (icon === 'directions_bus') return 'bus';
    }
    return 'train'; // default
}

// Collect all stops data from the form
function collectStops() {
    const stopCards = document.querySelectorAll('.group.flex.gap-4.relative.pb-10');
    const stops = [];

    stopCards.forEach((card) => {
        const cityInput = card.querySelector('input[type="text"]');
        const daysInput = card.querySelector('input[type="number"]');
        const city = cityInput?.value?.trim() || '';

        if (city) {
            stops.push({
                city: city,
                mode: getSelectedMode(card),
                stay_days: parseInt(daysInput?.value) || 1
            });
        }
    });

    return stops;
}

// Create the trip
async function createTrip(btn) {
    const { TripAPI, StopAPI, showToast, showLoading, hideLoading } = window.GlobeTrotterAPI;

    // Get form values
    const tripNameInput = document.querySelector('input[placeholder*="Summer in Italy"]');
    const dateInputs = document.querySelectorAll('input[type="date"]');

    const tripName = tripNameInput?.value?.trim() || '';
    const startDate = dateInputs[0]?.value || null;
    const endDate = dateInputs[1]?.value || null;
    const stops = collectStops();

    // Validation
    if (!tripName) {
        showToast('Please enter a trip name!', 'error');
        tripNameInput?.focus();
        return;
    }

    if (stops.length === 0) {
        showToast('Please add at least one city!', 'error');
        return;
    }

    // Show loading state
    showLoading(btn);

    try {
        // Create trip in backend
        console.log('Creating trip:', { tripName, startDate, endDate, stops });
        const trip = await TripAPI.create(tripName, startDate, endDate);
        console.log('Trip created:', trip);

        // Add all stops
        for (const stop of stops) {
            console.log('Adding stop:', stop);
            await StopAPI.add(trip.id, stop.city, stop.mode, stop.stay_days);
        }

        showToast(`"${tripName}" created successfully!`, 'success');

        // Store trip ID and redirect
        localStorage.setItem('currentTripId', trip.id);

        setTimeout(() => {
            window.location.href = 'itinerary.html';
        }, 1500);

    } catch (error) {
        console.error('Error creating trip:', error);
        showToast('Error: ' + error.message, 'error');
        hideLoading(btn);
    }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
