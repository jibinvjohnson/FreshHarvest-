# FreshHarvest Core Algorithms & Mathematical Formulations

This document specifies the algorithmic logic, pseudocode, time complexity, and invariant proofs for the three differentiating pillars of **FreshHarvest**:
1. **Harvest Promise Reliability (Variance Analysis)**
2. **Fair Pre-Order Stock Allocation (FIFO & Proportional Policies)**
3. **Surplus Produce Rescue & Expiration Management**

---

## 1. Harvest Promise Reliability Algorithm

### Problem Statement
Farmers publish crop commitments (expected harvest volume and estimated plucking date). When field harvesting occurs, physical yields deviate due to climatic conditions, pests, and irrigation factors. The system must objectively compute absolute and relative variance without division-by-zero errors and preserve audited historical snapshots.

### Mathematical Formulation
Let:
- $Q_E \in \mathbb{R}_{\ge 0}$: Expected Harvest Quantity (forecasted crop volume).
- $Q_A \in \mathbb{R}_{\ge 0}$: Actual Harvest Quantity (physically weighed yield).

The **Harvest Variance Quantity** ($\Delta Q$) is:
$$\Delta Q = Q_A - Q_E$$

The **Harvest Variance Percentage** ($V_{\%}$) is:
$$V_{\%} = \begin{cases} 
0\% & \text{if } Q_E = 0 \text{ and } Q_A = 0 \\
+100\% & \text{if } Q_E = 0 \text{ and } Q_A > 0 \\
\left(\frac{Q_A - Q_E}{Q_E}\right) \times 100 & \text{if } Q_E > 0 
\end{cases}$$

### Classification Rules
$$\text{Outcome} = \begin{cases} 
\text{Exact Match} & \text{if } \Delta Q = 0 \\
\text{Surplus (Excess Yield)} & \text{if } \Delta Q > 0 \\
\text{Shortfall (Deficit Shortage)} & \text{if } \Delta Q < 0 
\end{cases}$$

### Algorithm Pseudocode
```text
Algorithm: CALCULATE_HARVEST_VARIANCE(expected_quantity, actual_quantity)
Input: expected_quantity (Numeric >= 0), actual_quantity (Numeric >= 0)
Output: Structure containing variance_quantity, variance_percentage, outcome_status

1. IF expected_quantity < 0 OR actual_quantity < 0 THEN
2.     THROW InvalidArgumentException("Quantities cannot be negative")
3. END IF
4. 
5. variance_quantity <- actual_quantity - expected_quantity
6. 
7. IF expected_quantity == 0 THEN
8.     IF actual_quantity > 0 THEN
9.         variance_percentage <- 100.0
10.    ELSE
11.        variance_percentage <- 0.0
12.    END IF
13. ELSE
14.    variance_percentage <- ((actual_quantity - expected_quantity) / expected_quantity) * 100.0
15. END IF
16. 
17. IF variance_quantity < 0 THEN
18.    outcome_status <- "Shortfall"
19. ELSE IF variance_quantity > 0 THEN
20.    outcome_status <- "Surplus"
21. ELSE
22.    outcome_status <- "Exact Match"
23. END IF
24. 
25. RETURN { variance_quantity, ROUND(variance_percentage, 2), outcome_status }
```

### Complexity
- **Time Complexity:** $O(1)$ constant time scalar computation.
- **Space Complexity:** $O(1)$ auxiliary space.

---

## 2. Fair Pre-Order Stock Allocation Algorithm

### Problem Statement
Customer reservations (pre-orders) are placed against expected crop commitments before harvest. When the confirmed harvest batch is entered, the actual quantity may be less than total requested reservations. The system must allocate available stock fairly according to a declared policy without ever exceeding available inventory.

### Critical Invariant
Let $S_{avail}$ be the available quantity in confirmed harvest batch $B$, and let $A_i$ be the quantity allocated to pre-order $P_i$.
$$\sum_{i=1}^{n} A_i \le S_{avail}$$
**Under no condition shall total allocated quantity exceed available harvest batch stock.**

### Policy A: First-In, First-Out (FIFO / Earliest Reservation First)
Pre-orders are sorted chronologically by their reservation timestamp (`placed_at`). Each pre-order is fully satisfied in arrival order until stock is exhausted. Any remaining pre-orders receive partial or zero allocation.

```text
Algorithm: ALLOCATE_FIFO(batch, pre_orders)
Input: batch (HarvestBatch with available_quantity >= 0), pre_orders (List of PreOrder)
Output: AllocationPlan (Allocations list, remaining stock, unfulfilled shortage)

1. remaining_stock <- batch.available_quantity
2. SORT pre_orders ASCENDING by placed_at
3. allocations <- EMPTY_LIST
4. 
5. FOR EACH po IN pre_orders DO
6.     IF po.status == "Cancelled" OR po.status == "Fulfilled" THEN
7.         CONTINUE
8.     END IF
9.     
10.    unmet_demand <- po.requested_quantity - po.allocated_quantity
11.    IF unmet_demand <= 0 THEN CONTINUE END IF
12.    
13.    grant <- MIN(unmet_demand, MAX(0, remaining_stock))
14.    remaining_stock <- remaining_stock - grant
15.    
16.    total_allocated <- po.allocated_quantity + grant
17.    unfulfilled <- po.requested_quantity - total_allocated
18.    
19.    IF total_allocated >= po.requested_quantity THEN
20.        new_status <- "Fully Allocated"
21.    ELSE IF total_allocated > 0 THEN
22.        new_status <- "Partially Allocated"
23.    ELSE
24.        new_status <- "Pending"
25.    END IF
26.    
27.    APPEND to allocations: { po.pre_order_id, grant, total_allocated, unfulfilled, new_status }
28. END FOR
29. 
30. total_granted <- SUM(allocations.grant)
31. total_demand <- SUM(pre_orders.requested_quantity)
32. shortage <- MAX(0, total_demand - total_granted)
33. 
34. RETURN { total_granted, remaining_stock, shortage, allocations }
```

### Policy B: Proportional Allocation (Fair Share)
If total demand $D = \sum unmet\_demand_i > S_{avail}$, each customer receives a fraction of available stock proportional to their requested demand:
$$A_i = \min\left(unmet\_demand_i, \; S_{avail} \times \frac{unmet\_demand_i}{D}\right)$$

### Complexity
- **Time Complexity:** $O(N \log N)$ where $N$ is the number of active pre-orders (dominated by timestamp sorting).
- **Space Complexity:** $O(N)$ to store the simulation plan items.

---

## 3. Surplus Produce Rescue & Expiration Algorithm

### Problem Statement
When a harvest batch yields more produce than pre-order reservations, or when eligible inventory remains unallocated, fresh produce risks spoilage if not sold quickly. FreshHarvest allows farmers to list this surplus at a discounted unit price ($P_{disc} \le P_{orig}$) with a strict cutoff timestamp (`sale_deadline`).

### Rules & Invariants
1. **Stock Invariant:**
   $$Q_{listed} \le S_{batch\_available}$$
2. **Price Invariant:**
   $$0 \le P_{discounted} \le P_{original}$$
3. **Temporal Invariant:**
   If $\text{CURRENT\_TIMESTAMP} \ge \text{sale\_deadline}$, status transitions to `'Expired'` and purchase requests are rejected.
4. **Conservation of Mass:**
   When a purchase of quantity $q$ occurs:
   $$Q_{sold} \leftarrow Q_{sold} + q$$
   $$S_{batch\_available} \leftarrow S_{batch\_available} - q$$

```text
Algorithm: PURCHASE_SURPLUS(surplus_id, customer_id, purchase_quantity)
Input: surplus_id (UUID), customer_id (UUID), purchase_quantity (Numeric > 0)
Output: Order, OrderItem, Payment records

1. listing <- FETCH surplus_listing WHERE surplus_id = surplus_id
2. IF listing.status != "Active" THEN
3.     THROW InvalidStateException("Listing is no longer active")
4. END IF
5. 
6. IF CURRENT_TIMESTAMP >= listing.sale_deadline THEN
7.     listing.status <- "Expired"
8.     THROW ExpiredListingException("Surplus listing sale deadline has passed")
9. END IF
10. 
11. remaining_surplus <- listing.quantity_listed - listing.quantity_sold
12. IF purchase_quantity > remaining_surplus THEN
13.     THROW InsufficientSurplusException("Requested quantity exceeds remaining surplus")
14. END IF
15. 
16. batch <- FETCH harvest_batch WHERE harvest_id = listing.harvest_id
17. IF purchase_quantity > batch.available_quantity THEN
18.     THROW InsufficientBatchException("Requested quantity exceeds available batch inventory")
19. END IF
20. 
21. BEGIN TRANSACTION;
22.   listing.quantity_sold <- listing.quantity_sold + purchase_quantity
23.   IF listing.quantity_sold >= listing.quantity_listed THEN
24.       listing.status <- "Sold Out"
25.   END IF
26.   
27.   batch.available_quantity <- batch.available_quantity - purchase_quantity
28.   IF batch.available_quantity == 0 THEN
29.       batch.status <- "Sold Out"
30.   END IF
31.   
32.   total_price <- purchase_quantity * listing.discounted_unit_price
33.   order <- CREATE_ORDER(customer_id, total_price, status="Confirmed")
34.   order_item <- CREATE_ORDER_ITEM(order.id, batch.product_id, batch.id, purchase_quantity, listing.discounted_unit_price)
35.   payment <- RECORD_PAYMENT(order.id, total_price, status="Completed")
36.   
37.   LOG_HARVEST_AUDIT(batch.id, "SURPLUS_SOLD", { sold: purchase_quantity, remaining: batch.available_quantity })
38. COMMIT TRANSACTION;
39. 
40. RETURN { order, order_item, payment }
```

### Complexity
- **Time Complexity:** $O(1)$ constant time database lookup and update with indexed primary keys.
- **Space Complexity:** $O(1)$ auxiliary memory.
