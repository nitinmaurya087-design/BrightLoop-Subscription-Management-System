package com.brightloop.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private long totalCustomers;
    private long activeSubscriptions;
    private long totalProducts;
    private long totalPlans;
    private BigDecimal monthlyRecurringRevenue; // MRR
    private BigDecimal annualRecurringRevenue;  // ARR
    private BigDecimal totalRevenueCollected;
    private BigDecimal outstandingPayments;
    private long overdueInvoicesCount;
    private long upcomingRenewalsCount;

    // Charts
    private List<MonthlyDataPoint> monthlyRevenueTrend;
    private List<MonthlyDataPoint> mrrTrend;
    private List<MonthlyDataPoint> subscriptionGrowth;
    private Map<String, Long> subscriptionStatusDistribution;
    private Map<String, BigDecimal> revenueByProduct;
    private Map<String, BigDecimal> paymentsByMethod;

    // Recent Activity
    private List<RecentActivityItem> recentSubscriptions;
    private List<RecentActivityItem> recentPayments;
    private List<RecentActivityItem> recentInvoices;

    public DashboardStatsDto() {}

    public static class MonthlyDataPoint {
        private String month;
        private BigDecimal amount;
        private long count;

        public MonthlyDataPoint() {}
        public MonthlyDataPoint(String month, BigDecimal amount, long count) {
            this.month = month;
            this.amount = amount;
            this.count = count;
        }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class RecentActivityItem {
        private String id;
        private String title;
        private String subtitle;
        private String status;
        private BigDecimal amount;
        private String date;

        public RecentActivityItem() {}
        public RecentActivityItem(String id, String title, String subtitle, String status, BigDecimal amount, String date) {
            this.id = id;
            this.title = title;
            this.subtitle = subtitle;
            this.status = status;
            this.amount = amount;
            this.date = date;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getSubtitle() { return subtitle; }
        public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
    }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }
    public long getActiveSubscriptions() { return activeSubscriptions; }
    public void setActiveSubscriptions(long activeSubscriptions) { this.activeSubscriptions = activeSubscriptions; }
    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }
    public long getTotalPlans() { return totalPlans; }
    public void setTotalPlans(long totalPlans) { this.totalPlans = totalPlans; }
    public BigDecimal getMonthlyRecurringRevenue() { return monthlyRecurringRevenue; }
    public void setMonthlyRecurringRevenue(BigDecimal monthlyRecurringRevenue) { this.monthlyRecurringRevenue = monthlyRecurringRevenue; }
    public BigDecimal getAnnualRecurringRevenue() { return annualRecurringRevenue; }
    public void setAnnualRecurringRevenue(BigDecimal annualRecurringRevenue) { this.annualRecurringRevenue = annualRecurringRevenue; }
    public BigDecimal getTotalRevenueCollected() { return totalRevenueCollected; }
    public void setTotalRevenueCollected(BigDecimal totalRevenueCollected) { this.totalRevenueCollected = totalRevenueCollected; }
    public BigDecimal getOutstandingPayments() { return outstandingPayments; }
    public void setOutstandingPayments(BigDecimal outstandingPayments) { this.outstandingPayments = outstandingPayments; }
    public long getOverdueInvoicesCount() { return overdueInvoicesCount; }
    public void setOverdueInvoicesCount(long overdueInvoicesCount) { this.overdueInvoicesCount = overdueInvoicesCount; }
    public long getUpcomingRenewalsCount() { return upcomingRenewalsCount; }
    public void setUpcomingRenewalsCount(long upcomingRenewalsCount) { this.upcomingRenewalsCount = upcomingRenewalsCount; }
    public List<MonthlyDataPoint> getMonthlyRevenueTrend() { return monthlyRevenueTrend; }
    public void setMonthlyRevenueTrend(List<MonthlyDataPoint> monthlyRevenueTrend) { this.monthlyRevenueTrend = monthlyRevenueTrend; }
    public List<MonthlyDataPoint> getMrrTrend() { return mrrTrend; }
    public void setMrrTrend(List<MonthlyDataPoint> mrrTrend) { this.mrrTrend = mrrTrend; }
    public List<MonthlyDataPoint> getSubscriptionGrowth() { return subscriptionGrowth; }
    public void setSubscriptionGrowth(List<MonthlyDataPoint> subscriptionGrowth) { this.subscriptionGrowth = subscriptionGrowth; }
    public Map<String, Long> getSubscriptionStatusDistribution() { return subscriptionStatusDistribution; }
    public void setSubscriptionStatusDistribution(Map<String, Long> subscriptionStatusDistribution) { this.subscriptionStatusDistribution = subscriptionStatusDistribution; }
    public Map<String, BigDecimal> getRevenueByProduct() { return revenueByProduct; }
    public void setRevenueByProduct(Map<String, BigDecimal> revenueByProduct) { this.revenueByProduct = revenueByProduct; }
    public Map<String, BigDecimal> getPaymentsByMethod() { return paymentsByMethod; }
    public void setPaymentsByMethod(Map<String, BigDecimal> paymentsByMethod) { this.paymentsByMethod = paymentsByMethod; }
    public List<RecentActivityItem> getRecentSubscriptions() { return recentSubscriptions; }
    public void setRecentSubscriptions(List<RecentActivityItem> recentSubscriptions) { this.recentSubscriptions = recentSubscriptions; }
    public List<RecentActivityItem> getRecentPayments() { return recentPayments; }
    public void setRecentPayments(List<RecentActivityItem> recentPayments) { this.recentPayments = recentPayments; }
    public List<RecentActivityItem> getRecentInvoices() { return recentInvoices; }
    public void setRecentInvoices(List<RecentActivityItem> recentInvoices) { this.recentInvoices = recentInvoices; }
}
