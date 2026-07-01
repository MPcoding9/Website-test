/* Son Auba Retreat — shared booking calendar widget.
   Loaded only by room-*.html pages, which set window.BOOKING_CONFIG before including this file:
   window.BOOKING_CONFIG = { rate: 195, minNights: 2, roomLabel: 'Courtyard Room', blockedDates: ['2026-07-08', ...] }; */
(function(){
  var config = window.BOOKING_CONFIG;
  if (!config) return;

  var RATE = config.rate;
  var MIN_NIGHTS = config.minNights;
  var BLOCKED = config.blockedDates || [];

  var today = new Date(); today.setHours(0,0,0,0);
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  var checkIn = null, checkOut = null;

  var monthLabel = document.getElementById('calMonthLabel');
  var daysEl = document.getElementById('calDays');
  var prevBtn = document.getElementById('calPrev');
  var nextBtn = document.getElementById('calNext');
  var summaryEl = document.getElementById('calSummary');
  var arrivalInput = document.getElementById('arrival');
  var departureInput = document.getElementById('departure');
  var requestBtn = document.getElementById('requestBtn');

  if (!daysEl) return;

  function iso(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
  function fmt(d){ return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }); }
  function isBlocked(d){ return BLOCKED.indexOf(iso(d)) !== -1; }
  function isPast(d){ return d < today; }

  function render(){
    var y = view.getFullYear(), m = view.getMonth();
    monthLabel.textContent = view.toLocaleDateString('en-GB', { month:'long', year:'numeric' });
    prevBtn.disabled = (y === today.getFullYear() && m === today.getMonth());

    var firstDay = new Date(y, m, 1);
    var startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
    var daysInMonth = new Date(y, m+1, 0).getDate();

    daysEl.innerHTML = '';
    for (var i=0; i<startOffset; i++){
      var empty = document.createElement('span');
      empty.className = 'cal-day is-empty';
      daysEl.appendChild(empty);
    }
    for (var d=1; d<=daysInMonth; d++){
      var date = new Date(y, m, d);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = d;
      var disabled = isPast(date) || isBlocked(date);
      var cls = 'cal-day ' + (disabled ? 'is-disabled' : 'is-available');
      if (checkIn && date.getTime() === checkIn.getTime()) cls += ' is-selected';
      if (checkOut && date.getTime() === checkOut.getTime()) cls += ' is-selected';
      if (checkIn && checkOut && date > checkIn && date < checkOut) cls += ' is-in-range';
      btn.className = cls;
      if (disabled) { btn.disabled = true; }
      else {
        btn.addEventListener('click', function(dt){
          return function(){ pick(dt); };
        }(date));
      }
      daysEl.appendChild(btn);
    }
  }

  function pick(date){
    if (!checkIn || (checkIn && checkOut)) {
      checkIn = date; checkOut = null;
    } else if (date <= checkIn) {
      checkIn = date; checkOut = null;
    } else {
      checkOut = date;
    }
    updateSummary();
    render();
  }

  function updateSummary(){
    if (!summaryEl) return;
    if (checkIn && checkOut) {
      var nights = Math.round((checkOut - checkIn) / 86400000);
      if (nights < MIN_NIGHTS) {
        summaryEl.innerHTML = '<div class="cal-summary-text"><span>Minimum stay is ' + MIN_NIGHTS + ' nights — pick a later checkout.</span></div>';
        requestBtn.disabled = true;
      } else {
        var total = nights * RATE;
        summaryEl.innerHTML = '<div class="cal-summary-text"><b>' + fmt(checkIn) + ' — ' + fmt(checkOut) + '</b><span>' + nights + ' night' + (nights>1?'s':'') + ' · €' + total.toLocaleString() + ' total</span></div>';
        requestBtn.disabled = false;
        if (arrivalInput) arrivalInput.value = iso(checkIn);
        if (departureInput) departureInput.value = iso(checkOut);
      }
    } else if (checkIn) {
      summaryEl.innerHTML = '<div class="cal-summary-text"><span>Check-in ' + fmt(checkIn) + ' — choose a checkout date.</span></div>';
      requestBtn.disabled = true;
    } else {
      summaryEl.innerHTML = '<div class="cal-summary-text"><span>Select your check-in and checkout dates.</span></div>';
      requestBtn.disabled = true;
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', function(){ view.setMonth(view.getMonth()-1); render(); });
  if (nextBtn) nextBtn.addEventListener('click', function(){ view.setMonth(view.getMonth()+1); render(); });
  if (requestBtn) requestBtn.addEventListener('click', function(){
    var form = document.getElementById('bookingForm');
    if (form) form.scrollIntoView({ behavior:'smooth', block:'center' });
  });

  render();
  updateSummary();
})();
