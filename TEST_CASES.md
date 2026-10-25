# FreshHarvest Automated Test Suite & Integrity Validation Report

## 1. Test Execution Summary

- **Test Framework:** Vitest v3.2.7 (Node.js test environment)
- **Execution Date:** 2026-10-25
- **Total Test Cases:** 14
- **Passed:** 14
- **Failed:** 0
- **Execution Time:** ~1.03s

```text
 ✓ tests/business-logic.test.ts (14 tests) 10ms

 Test Files  1 passed (1)
      Tests  14 passed (14)
   Start at  18:09:36
   Duration  1.22s (transform 94ms, setup 0ms, collect 171ms, tests 10ms, environment 0ms, prepare 151ms)
```

---

## 2. Test Cases and Verification Matrix

| # | Test Scenario | Input Data | Expected Outcome | Actual Result | Status |
|---|---------------|------------|------------------|---------------|:------:|
| **1** | Variance calculation for a harvest shortfall | Expected = 100 kg, Actual = 70 kg | Variance = -30 kg, Variance % = -30%, Status = `'Shortfall'` | Returned -30 kg, -30.00%, Shortfall | **PASS** |
| **2** | Variance calculation for a harvest surplus | Expected = 80 kg, Actual = 95 kg | Variance = +15 kg, Variance % = +18.75%, Status = `'Surplus'` | Returned 15 kg, 18.75%, Surplus | **PASS** |
| **3** | Zero expected quantity safe division handling | Expected = 0, Actual = 50 kg; Expected = 0, Actual = 0 | No divide-by-zero exception; returns 100% or 0% | Handled safely, 100% and 0% computed | **PASS** |
| **4** | Stock exactly equals pre-order demand | Available = 50 kg, Demand = [30 kg, 20 kg] | Both pre-orders fully satisfied (30 kg & 20 kg); Remaining stock = 0 kg; Shortage = 0 kg | Fully allocated 50 kg, remaining 0 kg | **PASS** |
| **5** | Benchmark Scenario: Demand exceeds actual harvest | Harvest = 70 kg, Pre-orders: Alice (35 kg, 09:00), Bob (35 kg, 10:00), Catherine (20 kg, 11:00) (Total = 90 kg) | FIFO satisfies Alice (35 kg full), Bob (35 kg full), Catherine (0 kg waiting); Total allocated = 70 kg; Shortfall = 20 kg | Allocated exactly 70 kg; Catherine granted 0 kg with 20 kg shortage | **PASS** |
| **6** | Partial stock fulfilment | Available = 50 kg, Single Pre-Order = 80 kg | Granted = 50 kg; Unfulfilled = 30 kg; Status = `'Partially Allocated'` | Granted 50 kg; Unfulfilled 30 kg; Status Partially Allocated | **PASS** |
| **7** | Allocation invariant enforcement | Available = 15 kg, Demand = 100 kg | Total allocated strictly $\le 15$ kg (Invariant holds) | Total allocated = 15 kg; never exceeded batch stock | **PASS** |
| **8** | Repeated allocation prevention | Exhausted batch (`available_quantity = 0`) | Exception thrown preventing duplicate allocation runs | Threw `'No stock available for allocation in this harvest batch'` | **PASS** |
| **9** | Rejection of invalid negative quantities | Harvest quantity = -25 kg; Expected quantity = -10 kg | Zod schema & check constraint throw validation error | Threw `'Quantity cannot be negative'` | **PASS** |
| **10** | Surplus purchase limit | Remaining surplus = 15 kg, Purchase attempt = 50 kg | Rejected with insufficient stock exception | Threw `'Requested 50 exceeds remaining surplus of 15'` | **PASS** |
| **11** | Expired surplus listing rejection | Listing with past deadline (`sale_deadline < NOW()`) | Purchase rejected with expiry exception | Threw `'Listing has expired past its sale deadline'` | **PASS** |
| **12** | Server-side order total recalculation | Line items: 5 kg @ ₹45 (₹225) + 3 kg @ ₹60 (₹180) | Server computes subtotal ₹225, ₹180, total ₹405; rejects client tampering | Server calculated exact order total ₹405.00 | **PASS** |
| **13** | Foreign-key referential integrity check | Farm with non-existent `farmer_id = 'uuid-ghost'` | Foreign key check fails with informative error | Threw `'Foreign key violation: Specified farmer_id does not exist'` | **PASS** |
| **14** | Transactional failure state rollback | Invalid multi-step purchase triggering failure mid-routine | Batch available quantity remains unchanged; no dirty state | Stock preserved at initial level with zero corruption | **PASS** |

---

## 3. How to Run Tests Locally

Execute the test command from the workspace root:

```bash
# Run Vitest test suite once
npm test

# Run tests in interactive watch mode during development
npx vitest
```
