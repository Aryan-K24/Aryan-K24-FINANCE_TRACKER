document.addEventListener('DOMContentLoaded', () => {
    const plannerForm = document.getElementById('plannerForm');
    const resultBox = document.getElementById('resultBox');
    const resetBtn = document.getElementById('resetBtn');
    const calculateBtn = document.getElementById('calculateBtn'); 
    const percentInput = document.getElementById('save-percent');

    function formatTime(totalMonths) {
        if (totalMonths < 12) {
            return `${totalMonths} ${totalMonths === 1 ? 'month' : 'months'}`;
        } else {
            const years = Math.floor(totalMonths / 12);
            const remainingMonths = totalMonths % 12;
            let yearText = `${years} ${years === 1 ? 'year' : 'years'}`;
            let monthText = remainingMonths > 0 ? ` and ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}` : "";
            return yearText + monthText;
        }
    }

    plannerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Visual Feedback
        calculateBtn.disabled = true;
        calculateBtn.style.opacity = "0.7";
        calculateBtn.innerText = "Calculating... ⏳";
        resultBox.classList.add('hidden'); 

        // 2. The 3-second delay (3000ms)
        setTimeout(() => {
            const salary = parseFloat(document.getElementById('monthly-salary').value);
            const genSavings = parseFloat(document.getElementById('monthly-savings').value);
            const itemName = document.getElementById('item-name').value;
            const price = parseFloat(document.getElementById('item-price').value);
            
            let percent = parseFloat(percentInput.value);
            if (isNaN(percent)) {
                percent = 20; // Defaulting to 20%
                percentInput.value = 20;
            }

            const leftover = salary - genSavings;

            if (leftover <= 0) {
                alert("Your general savings goal is higher than your salary!");
                calculateBtn.disabled = false;
                calculateBtn.style.opacity = "1";
                calculateBtn.innerText = "Calculate Plan";
                return;
            }

            const itemSavingPerMonth = leftover * (percent / 100);
            const totalMonths = Math.ceil(price / itemSavingPerMonth);

            const timeString = formatTime(totalMonths);
            const fmtPrice = new Intl.NumberFormat('en-IN').format(price);
            const fmtLeftover = new Intl.NumberFormat('en-IN').format(leftover);
            const fmtItemSaving = new Intl.NumberFormat('en-IN').format(itemSavingPerMonth);
const today = new Date();
const targetDate = new Date(today.getFullYear(), today.getMonth() + totalMonths, 1);
const targetMonth = targetDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

const halfwayMonths = Math.ceil(totalMonths / 2);

let milestonesHTML = '';
for (let m = 1; m <= totalMonths; m++) {
  const saved = Math.min(Math.round(itemSavingPerMonth * m), price);
  const isLast = m === totalMonths;
  const isHalf = m === halfwayMonths;
  const dot = isLast ? '#7c3aed' : isHalf ? '#3b82f6' : '#9ca3af';
  const bg = isLast ? '#f0f4ff' : '#f8f7ff';
  const color = isLast ? '#7c3aed' : '#4b5563';
  const weight = isLast ? '600' : '400';
  const note = isLast ? ' 🎉' : isHalf ? ' · halfway' : '';
  milestonesHTML += `
    <div style="display:flex;align-items:center;gap:6px;font-size:12px;background:${bg};padding:5px 12px;border-radius:100px;color:${color};font-weight:${weight};">
      <span style="width:8px;height:8px;border-radius:50%;background:${dot};display:inline-block;flex-shrink:0;"></span>
      Month ${m} — ₹${saved.toLocaleString('en-IN')} saved${note}
    </div>
  `;
}

document.getElementById('resultContent').innerHTML = `
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:1.25rem;">
    <div style="background:#f8f7ff;border-radius:10px;padding:0.9rem 1rem;">
      <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">Monthly saving</div>
      <div style="font-size:1.3rem;font-weight:600;color:#7c3aed;">₹${fmtItemSaving}</div>
    </div>
    <div style="background:#f8f7ff;border-radius:10px;padding:0.9rem 1rem;">
      <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">Item price</div>
      <div style="font-size:1.3rem;font-weight:600;color:#1e1b4b;">₹${fmtPrice}</div>
    </div>
    <div style="background:#f8f7ff;border-radius:10px;padding:0.9rem 1rem;">
      <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">Time needed</div>
      <div style="font-size:1.3rem;font-weight:600;color:#7c3aed;">${timeString}</div>
    </div>
  </div>

  <div style="font-size:12px;color:#9ca3af;margin-bottom:8px;">Progress timeline</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1.25rem;">
    ${milestonesHTML}
  </div>

  <div style="background:#f0f4ff;border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">You can buy</div>
      <div style="font-size:1.1rem;font-weight:600;color:#1e1b4b;">${itemName}</div>
      <div style="font-size:1rem;font-weight:600;color:#7c3aed;margin-top:2px;">by ${targetMonth}</div>
    </div>
    <div style="background:#7c3aed;color:white;font-size:12px;font-weight:600;padding:6px 14px;border-radius:100px;">${timeString} away</div>
  </div>
`;

resultBox.classList.remove('hidden');
calculateBtn.disabled = false;
calculateBtn.style.opacity = "1";
calculateBtn.innerText = "Calculate Plan";
        }, 3000); // Changed to 3 seconds
    });

    resetBtn.addEventListener('click', () => {
        plannerForm.reset();
        percentInput.value = ""; 
        resultBox.classList.add('hidden');
    });
});