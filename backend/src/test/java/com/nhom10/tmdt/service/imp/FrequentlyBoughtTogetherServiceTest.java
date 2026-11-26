package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.enums.PaymentStatus;
import com.nhom10.tmdt.enums.ProductType;
import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.repo.ProductRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class FrequentlyBoughtTogetherServiceTest {
    private final EntityManager entityManager = mock(EntityManager.class);
    private final ProductRepository productRepo = mock(ProductRepository.class);
    private final FrequentlyBoughtTogetherService service = new FrequentlyBoughtTogetherService(entityManager, productRepo);

    @Test
    void computesSupportConfidenceAndLiftFromDistinctBaskets() {
        List<Set<Long>> baskets = new ArrayList<>();
        addBaskets(baskets, 3, 1L, 2L);
        addBaskets(baskets, 1, 1L);
        addBaskets(baskets, 6, 3L);

        var rules = service.mineRules(1L, baskets);

        assertEquals(1, rules.size());
        var rule = rules.getFirst();
        assertEquals(2L, rule.productId());
        assertEquals(3, rule.orderCount());
        assertEquals(0.3, rule.support(), 1e-9);
        assertEquals(0.75, rule.confidence(), 1e-9);
        assertEquals(2.5, rule.lift(), 1e-9);
    }

    @Test
    void doesNotInventRulesFromOnlyOneOrTwoPurchases() {
        List<Set<Long>> baskets = new ArrayList<>();
        addBaskets(baskets, 2, 1L, 2L);
        addBaskets(baskets, 8, 3L);

        assertTrue(service.mineRules(1L, baskets).isEmpty());
    }

    @Test
    void rejectsPopularItemsThatHaveNoPositiveAssociation() {
        List<Set<Long>> baskets = new ArrayList<>();
        addBaskets(baskets, 3, 1L, 2L);
        addBaskets(baskets, 7, 2L, 3L);

        // B có trong mọi đơn: confidence = 1 nhưng lift = 1.
        assertTrue(service.mineRules(1L, baskets).isEmpty());
    }

    @Test
    void requiresMinimumConfidenceEvenWhenThePairAppearsThreeTimes() {
        List<Set<Long>> baskets = new ArrayList<>();
        addBaskets(baskets, 3, 1L, 2L);
        addBaskets(baskets, 17, 1L);
        addBaskets(baskets, 10, 3L);

        assertTrue(service.mineRules(1L, baskets).isEmpty());
    }

    @Test
    void appliesMinimumSupportAsTheTransactionHistoryGrows() {
        List<Set<Long>> baskets = new ArrayList<>();
        addBaskets(baskets, 3, 1L, 2L);
        addBaskets(baskets, 1, 1L);
        addBaskets(baskets, 196, 3L);

        // 3/200 = 1,5%, thấp hơn support tối thiểu 2%.
        assertTrue(service.mineRules(1L, baskets).isEmpty());
    }

    @Test
    void deduplicatesOrderLinesAndFiltersUnavailableProductsBeforeLimiting() {
        List<Object[]> rows = new ArrayList<>();
        for (long order = 1; order <= 3; order++) {
            rows.add(new Object[]{order, 1L});
            rows.add(new Object[]{order, 1L});
            rows.add(new Object[]{order, 2L});
            rows.add(new Object[]{order, 3L});
        }
        rows.add(new Object[]{4L, 1L});
        for (long order = 5; order <= 10; order++) rows.add(new Object[]{order, 4L});
        TypedQuery<Object[]> query = stubTransactions(rows);

        Product unavailable = ProductRecommendationServiceTest.product(2, "Sản phẩm hết hàng");
        unavailable.getProductMils().getFirst().setStockQuantity(0);
        Product available = ProductRecommendationServiceTest.product(3, "Sản phẩm còn hàng");
        when(productRepo.findAll()).thenReturn(List.of(unavailable, available));

        assertEquals(List.of(3L), service.findBoughtTogether(1L, 1).stream().map(Product::getId).toList());
        verify(query).setParameter("delivered", OrderStatus.DELIVERED);
        verify(query).setParameter("paid", PaymentStatus.PAID);
        verify(query).setParameter("normal", ProductType.NORMAL);
    }

    @Test
    void noHistoryReturnsEmptyInsteadOfUnrelatedFallbackProducts() {
        stubTransactions(List.of());

        assertTrue(service.findBoughtTogether(100L, 4).isEmpty());
        verifyNoInteractions(productRepo);
    }

    @Test
    void equalRulesHaveStableOrdering() {
        List<Set<Long>> baskets = new ArrayList<>();
        addBaskets(baskets, 3, 1L, 3L, 2L);
        addBaskets(baskets, 7, 4L);

        assertEquals(List.of(2L, 3L), service.mineRules(1L, baskets).stream()
                .map(FrequentlyBoughtTogetherService.AssociationRule::productId).toList());
    }

    @SuppressWarnings("unchecked")
    private TypedQuery<Object[]> stubTransactions(List<Object[]> rows) {
        TypedQuery<Object[]> query = mock(TypedQuery.class);
        when(entityManager.createQuery(anyString(), eq(Object[].class))).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.getResultList()).thenReturn(rows);
        return query;
    }

    private void addBaskets(List<Set<Long>> baskets, int count, Long... ids) {
        for (int index = 0; index < count; index++) baskets.add(Set.of(ids));
    }
}
