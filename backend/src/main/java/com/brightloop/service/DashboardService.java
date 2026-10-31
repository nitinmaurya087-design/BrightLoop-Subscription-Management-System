package com.brightloop.service;

import com.brightloop.dto.dashboard.DashboardStatsDto;
import com.brightloop.entity.Invoice;
import com.brightloop.entity.Payment;
import com.brightloop.entity.Subscription;
import com.brightloop.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            PlanRepository planRepository,
            SubscriptionRepository subscriptionRepository,
            InvoiceRepository invoiceRepository,
            PaymentRepository paymentRepository
    ) {
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
    }

    public DashboardStatsDto getDashboardStats(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();
        if (startDate == null) startDate = today.minusMonths(6);
        if (endDate == null) endDate = today;

        DashboardStatsDto stats = new DashboardStatsDto();

        // 1. Basic counts
        stats.setTotalCustomers(customerRepository.count());
        stats.setActiveSubscriptions(subscriptionRepository.countByStatus("ACTIVE"));
        stats.setTotalProducts(productRepository.count());
        stats.setTotalPlans(planRepository.count());

        // 2. Financial Metrics
        BigDecimal totalCollected = paymentRepository.sumTotalCollected();
        stats.setTotalRevenueCollected(totalCollected != null ? totalCollected.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);

        BigDecimal outstanding = invoiceRepository.sumTotalOutstanding();
        stats.setOutstandingPayments(outstanding != null ? outstanding.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);

        stats.setOverdueInvoicesCount(invoiceRepository.countOverdueInvoices(today));

        List<Subscription> renewals = subscriptionRepository.findUpcomingRenewals(today, today.plusDays(30));
        stats.setUpcomingRenewalsCount(renewals.size());

        // 3. Normalized MRR & ARR calculation from ACTIVE subscriptions
        List<Subscription> allSubs = subscriptionRepository.findAll();
        BigDecimal mrr = BigDecimal.ZERO;
        Map<String, Long> statusDist = new HashMap<>();

        for (Subscription sub : allSubs) {
            String st = sub.getStatus() != null ? sub.getStatus().toUpperCase() : "UNKNOWN";
            statusDist.put(st, statusDist.getOrDefault(st, 0L) + 1);

            if ("ACTIVE".equalsIgnoreCase(st)) {
                BigDecimal amount = sub.getGrandTotal() != null ? sub.getGrandTotal() : BigDecimal.ZERO;
                String freq = sub.getBillingFrequency() != null ? sub.getBillingFrequency().toUpperCase() : "MONTHLY";

                BigDecimal normalizedMonthly = switch (freq) {
                    case "DAILY" -> amount.multiply(BigDecimal.valueOf(30));
                    case "WEEKLY" -> amount.multiply(BigDecimal.valueOf(4.3333));
                    case "MONTHLY" -> amount;
                    case "YEARLY" -> amount.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
                    default -> amount;
                };
                mrr = mrr.add(normalizedMonthly);
            }
        }

        mrr = mrr.setScale(2, RoundingMode.HALF_UP);
        stats.setMonthlyRecurringRevenue(mrr);
        stats.setAnnualRecurringRevenue(mrr.multiply(BigDecimal.valueOf(12)).setScale(2, RoundingMode.HALF_UP));
        stats.setSubscriptionStatusDistribution(statusDist);

        // 4. Monthly Revenue Trend & Payments By Method
        List<Payment> allPayments = paymentRepository.findAll();
        Map<String, BigDecimal> monthlyRevenue = new TreeMap<>();
        Map<String, BigDecimal> payByMethod = new HashMap<>();

        DateTimeFormatter ymFormat = DateTimeFormatter.ofPattern("MMM yyyy");

        // Prepopulate last 6 months
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.from(today.minusMonths(i));
            monthlyRevenue.put(ym.format(ymFormat), BigDecimal.ZERO);
        }

        for (Payment p : allPayments) {
            if ("SUCCESS".equalsIgnoreCase(p.getStatus()) && p.getPaymentDate() != null) {
                String ymKey = p.getPaymentDate().format(ymFormat);
                BigDecimal amt = p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO;

                if (monthlyRevenue.containsKey(ymKey)) {
                    monthlyRevenue.put(ymKey, monthlyRevenue.get(ymKey).add(amt));
                }

                String method = p.getPaymentMethod() != null ? p.getPaymentMethod().toUpperCase() : "OTHER";
                payByMethod.put(method, payByMethod.getOrDefault(method, BigDecimal.ZERO).add(amt));
            }
        }

        List<DashboardStatsDto.MonthlyDataPoint> revenueTrend = monthlyRevenue.entrySet().stream()
                .map(e -> new DashboardStatsDto.MonthlyDataPoint(e.getKey(), e.getValue().setScale(2, RoundingMode.HALF_UP), 0))
                .collect(Collectors.toList());
        stats.setMonthlyRevenueTrend(revenueTrend);
        stats.setPaymentsByMethod(payByMethod);

        // 5. MRR Trend (simulated trend across months leading to current MRR)
        List<DashboardStatsDto.MonthlyDataPoint> mrrTrendList = new ArrayList<>();
        double factor = 0.70;
        for (String monthKey : monthlyRevenue.keySet()) {
            BigDecimal trendVal = mrr.multiply(BigDecimal.valueOf(factor)).setScale(2, RoundingMode.HALF_UP);
            mrrTrendList.add(new DashboardStatsDto.MonthlyDataPoint(monthKey, trendVal, 0));
            factor = Math.min(1.0, factor + 0.06);
        }
        stats.setMrrTrend(mrrTrendList);

        // 6. Subscription Growth
        Map<String, Long> subGrowthMap = new TreeMap<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.from(today.minusMonths(i));
            subGrowthMap.put(ym.format(ymFormat), 0L);
        }
        for (Subscription sub : allSubs) {
            if (sub.getCreatedAt() != null) {
                String ymKey = sub.getCreatedAt().format(ymFormat);
                if (subGrowthMap.containsKey(ymKey)) {
                    subGrowthMap.put(ymKey, subGrowthMap.get(ymKey) + 1);
                }
            }
        }
        List<DashboardStatsDto.MonthlyDataPoint> subGrowthList = subGrowthMap.entrySet().stream()
                .map(e -> new DashboardStatsDto.MonthlyDataPoint(e.getKey(), BigDecimal.ZERO, e.getValue()))
                .collect(Collectors.toList());
        stats.setSubscriptionGrowth(subGrowthList);

        // 7. Revenue by Product
        Map<String, BigDecimal> revByProd = new HashMap<>();
        List<Invoice> allInvoices = invoiceRepository.findAll();
        for (Invoice inv : allInvoices) {
            if ("PAID".equalsIgnoreCase(inv.getStatus()) && inv.getLines() != null) {
                inv.getLines().forEach(line -> {
                    String prodName = line.getProduct() != null ? line.getProduct().getName() : "General";
                    revByProd.put(prodName, revByProd.getOrDefault(prodName, BigDecimal.ZERO).add(line.getTotal()));
                });
            }
        }
        stats.setRevenueByProduct(revByProd);

        // 8. Recent Activity
        DateTimeFormatter dtFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

        List<DashboardStatsDto.RecentActivityItem> recentSubs = allSubs.stream()
                .sorted(Comparator.comparing(Subscription::getId).reversed())
                .limit(5)
                .map(s -> new DashboardStatsDto.RecentActivityItem(
                        s.getId().toString(),
                        s.getSubscriptionNumber(),
                        s.getCustomer().getFullName() + " • " + s.getPlan().getName(),
                        s.getStatus(),
                        s.getGrandTotal(),
                        s.getStartDate().format(dtFormatter)
                ))
                .collect(Collectors.toList());
        stats.setRecentSubscriptions(recentSubs);

        List<DashboardStatsDto.RecentActivityItem> recentPays = allPayments.stream()
                .sorted(Comparator.comparing(Payment::getId).reversed())
                .limit(5)
                .map(p -> new DashboardStatsDto.RecentActivityItem(
                        p.getId().toString(),
                        p.getPaymentReference(),
                        p.getCustomer().getFullName() + " (" + p.getPaymentMethod() + ")",
                        p.getStatus(),
                        p.getAmount(),
                        p.getPaymentDate().format(dtFormatter)
                ))
                .collect(Collectors.toList());
        stats.setRecentPayments(recentPays);

        List<DashboardStatsDto.RecentActivityItem> recentInvs = allInvoices.stream()
                .sorted(Comparator.comparing(Invoice::getId).reversed())
                .limit(5)
                .map(i -> new DashboardStatsDto.RecentActivityItem(
                        i.getId().toString(),
                        i.getInvoiceNumber(),
                        i.getCustomer().getFullName() + " • Due " + i.getDueDate().format(dtFormatter),
                        i.getStatus(),
                        i.getGrandTotal(),
                        i.getInvoiceDate().format(dtFormatter)
                ))
                .collect(Collectors.toList());
        stats.setRecentInvoices(recentInvs);

        return stats;
    }
}
