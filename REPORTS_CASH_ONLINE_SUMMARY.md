# 📊 Reports - Cash/Online Breakdown Feature

## ✅ What's Added

Ab **Reports** section mein har report (Daily, Weekly, Monthly) mein **Cash vs Online revenue breakdown** dikhta hai!

---

## 📈 Updated Reports

### 1️⃣ **Monthly Report**

Pehle (Old):
```
Monthly Revenue: Rs 500,000
```

Ab (New):
```
┌─────────────────────────────────────────┐
│ Monthly Revenue: Rs 500,000             │
├───────────────────┬─────────────────────┤
│ 💵 Cash Revenue   │ 💳 Online Revenue   │
│ Rs 300,000        │ Rs 200,000          │
│ 60% of total      │ 40% of total        │
└───────────────────┴─────────────────────┘
```

**Features:**
- Total monthly revenue prominently displayed
- Cash breakdown with percentage
- Online breakdown with percentage
- Visual cards (green for cash, blue for online)

---

### 2️⃣ **Weekly Report**

Same breakdown for weekly revenue:
```
┌─────────────────────────────────────────┐
│ Weekly Revenue: Rs 120,000              │
├───────────────────┬─────────────────────┤
│ 💵 Cash           │ 💳 Online           │
│ Rs 80,000         │ Rs 40,000           │
└───────────────────┴─────────────────────┘
```

---

### 3️⃣ **Daily Report**

Daily revenue breakdown:
```
┌─────────────────────────────────────────┐
│ Daily Revenue: Rs 25,000                │
├───────────────────┬─────────────────────┤
│ 💵 Cash           │ 💳 Online           │
│ Rs 15,000         │ Rs 10,000           │
└───────────────────┴─────────────────────┘
```

---

## 🎯 How It Works

### Data Source:
Reports automatically calculate from `cash_amount` and `online_amount` fields in bookings.

### Formula:
```javascript
Total Revenue = Sum of all bookings' total_amount
Cash Revenue  = Sum of all bookings' cash_amount
Online Revenue = Sum of all bookings' online_amount
Percentage = (Cash or Online / Total) × 100
```

### Example Calculation:
```
Month: January 2026

Bookings:
1. Total: Rs 100,000 | Cash: Rs 60,000 | Online: Rs 40,000
2. Total: Rs 80,000  | Cash: Rs 80,000 | Online: Rs 0
3. Total: Rs 120,000 | Cash: Rs 0      | Online: Rs 120,000

Results:
Total Revenue:  Rs 300,000
Cash Revenue:   Rs 140,000 (47%)
Online Revenue: Rs 160,000 (53%)
```

---

## 📱 Usage

### Access Reports:
1. **Dashboard** → **Reports** tab
2. Select report type:
   - **Daily** - Today's cash vs online
   - **Weekly** - This week's breakdown
   - **Monthly** - Current month or select specific month

### View Breakdown:
- Revenue shown in prominent yellow card at top
- Cash and Online shown in separate colored cards below
- Percentages automatically calculated
- Other stats (bookings, nights, occupancy) below

---

## 💡 Benefits

### For Accounting:
1. **Quick Overview:** See cash vs online at a glance
2. **Monthly Reports:** Perfect for month-end accounting
3. **Trend Analysis:** Compare cash/online ratio across months
4. **Cash Flow:** Know exactly how much cash in hand

### For Management:
1. **Payment Preferences:** See what guests prefer (cash/online)
2. **Bank Deposits:** Plan deposits based on cash collected
3. **Online Growth:** Track online payment adoption
4. **Decision Making:** Data-driven pricing/payment strategies

---

## 🔍 Example Use Cases

### End of Month Accounting:
```
Reports → Monthly → Select "January 2026"

See:
- Total Revenue: Rs 500,000
- Cash: Rs 300,000 (60%)
- Online: Rs 200,000 (40%)

Action:
- Reconcile Rs 300,000 cash with physical cash
- Match Rs 200,000 online with bank statements
```

### Weekly Cash Management:
```
Reports → Weekly → Current Week

See:
- Cash: Rs 50,000
- Online: Rs 30,000

Action:
- Plan bank deposit for Rs 50,000 cash
- Verify Rs 30,000 online payments cleared
```

### Daily Operations:
```
Reports → Daily → Today

See:
- Cash: Rs 15,000
- Online: Rs 10,000

Action:
- End-of-day cash count should match Rs 15,000
- Check online transactions in bank
```

---

## 📊 Visual Example

### Monthly Report Display:

```
╔═══════════════════════════════════════════════╗
║ Monthly Report - January 2026                 ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  Monthly Revenue          Rs 500,000          ║
║  ─────────────────────────────────────────   ║
║                                               ║
║  ┌─────────────────┬─────────────────┐       ║
║  │ 💵 Cash Revenue │ 💳 Online       │       ║
║  │ Rs 300,000      │ Rs 200,000      │       ║
║  │ 60% of total    │ 40% of total    │       ║
║  └─────────────────┴─────────────────┘       ║
║                                               ║
║  ┌─────────┬──────────┬──────────────┐       ║
║  │Bookings │  Nights  │  Occupancy   │       ║
║  │   25    │   180    │    75.0%     │       ║
║  └─────────┴──────────┴──────────────┘       ║
╚═══════════════════════════════════════════════╝
```

---

## ⚠️ Important Notes

### Database Required:
- Requires `cash_amount` and `online_amount` columns in bookings table
- Run SQL migration first: `ADD_PAYMENT_BREAKDOWN.sql`

### Existing Bookings:
- Old bookings (before migration) will show:
  - If payment_method = 'cash' → full advance in cash_amount
  - If payment_method = 'online' → full advance in online_amount
- New bookings properly track both separately

### Zero Values:
- If no cash payments: Cash shows Rs 0
- If no online payments: Online shows Rs 0
- Percentages calculated correctly even with zeros

---

## 🚀 Quick Test

1. **Run SQL Migration** (if not done):
   ```sql
   ALTER TABLE bookings
     ADD COLUMN IF NOT EXISTS cash_amount DECIMAL(10, 2) DEFAULT 0,
     ADD COLUMN IF NOT EXISTS online_amount DECIMAL(10, 2) DEFAULT 0;
   ```

2. **Refresh Browser:** Ctrl + Shift + R

3. **Go to Reports:** Dashboard → Reports tab

4. **Select Monthly Report:** Choose current month

5. **See Breakdown:** Cash and Online revenue displayed!

---

## 📞 Support

### Common Questions:

**Q: Purani bookings ka breakdown kaise dikhega?**
A: Migration script automatically migrate kar degi based on payment_method field.

**Q: Mixed payment bookings ka kya hoga?**
A: Perfect! Ab mixed payments properly track hongi (cash + online separately).

**Q: Percentage kaise calculate hota hai?**
A: (Cash Revenue / Total Revenue) × 100 aur (Online Revenue / Total Revenue) × 100

**Q: Kya har report mein breakdown hai?**
A: Haan! Daily, Weekly, aur Monthly - teeno mein breakdown hai.

---

## ✅ Feature Checklist

Before using:
- [ ] Run SQL migration (`ADD_PAYMENT_BREAKDOWN.sql`)
- [ ] Hard refresh browser
- [ ] Create test booking with mixed payment
- [ ] Check Reports → Monthly
- [ ] Verify cash and online breakdown shows correctly

After setup:
- [ ] Monthly reports for accounting ✓
- [ ] Weekly reports for cash flow ✓
- [ ] Daily reports for operations ✓
- [ ] Export functionality (CSV/Excel) ✓

---

**Feature Status: ✅ READY TO USE**

Just make sure SQL migration is run, then Reports will automatically show cash/online breakdown!
