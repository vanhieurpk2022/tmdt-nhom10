package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.dto.customscent.CreateCustomScentRequest;
import com.nhom10.tmdt.model.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
public class CustomScentPricing {
    @Value("${custom-scent.bottle-fee:20000}") private double bottleFee = 20000;
    @Value("${custom-scent.labor-fee:15000}") private double laborFee = 15000;

    public record Quote(double price, int stockQuantity, List<ProductMil> ingredients) {}

    public Quote quote(List<Product> products, CreateCustomScentRequest request) {
        Map<Long, ProductMil> variants = new HashMap<>();
        Map<Long, Double> volumes = new HashMap<>();
        List<ProductMil> selected = new ArrayList<>();
        Map<Long, Double> requestedVolumes = new HashMap<>();
        for (int i = 0; i < products.size(); i++) {
            requestedVolumes.merge(products.get(i).getId(), request.totalVolumeMl() * request.items().get(i).percentage() / 100, Double::sum);
        }
        double percentage = 0;
        for (int i = 0; i < products.size(); i++) {
            Product p = products.get(i);
            var item = request.items().get(i);
            if (!RecommendationEligibility.isAvailable(p) || p.getFactory() == null
                    || !Objects.equals(p.getFactory().getId(), request.factoryId())) throw invalid("Nguyên liệu không còn khả dụng tại xưởng đã chọn");
            double volume = request.totalVolumeMl() * item.percentage() / 100;
            if (!Double.isFinite(volume) || volume <= 0 || Math.abs(volume - item.volumeMl()) > 0.1) throw invalid("Dung tích nguyên liệu không hợp lệ");
            percentage += item.percentage();
            ProductMil v = selectVariant(p, requestedVolumes.get(p.getId()));
            variants.put(v.getId(), v);
            volumes.merge(v.getId(), volume, Double::sum);
            selected.add(v);
        }
        if (Math.abs(percentage - 100) > 0.01) throw invalid("Tổng tỷ lệ phối hương phải bằng 100%");
        Double factoryFee = products.isEmpty() || products.getFirst().getFactory() == null ? null : products.getFirst().getFactory().getCustomServiceFee();
        double serviceFee = factoryFee == null ? laborFee : factoryFee;
        if (!Double.isFinite(serviceFee) || serviceFee < 0 || !Double.isFinite(bottleFee) || bottleFee < 0) throw invalid("Xưởng chưa cấu hình phí phối hương hợp lệ");
        double price = bottleFee + serviceFee;
        int stock = Integer.MAX_VALUE;
        for (var entry : volumes.entrySet()) {
            ProductMil v = variants.get(entry.getKey());
            int bottles = bottles(entry.getValue(), v.getMil());
            // Kho hiện lưu theo chai: tính và xuất nguyên chai nguyên liệu để không bán vượt kho.
            price += bottles * price(v);
            stock = Math.min(stock, v.getStockQuantity() / bottles);
        }
        if (!Double.isFinite(price) || price <= 0 || stock <= 0) throw invalid("Không đủ nguyên liệu để phối dung tích đã chọn");
        return new Quote(Math.ceil(price), stock, selected);
    }

    public static int bottles(double volume, int mil) {
        if (!Double.isFinite(volume) || volume <= 0 || mil <= 0) throw invalid("Dung tích nguyên liệu không hợp lệ");
        double count = Math.ceil((volume - 0.000001) / mil);
        if (count < 1 || count > Integer.MAX_VALUE) throw invalid("Lượng nguyên liệu vượt giới hạn");
        return (int) count;
    }

    public static ProductMil selectVariant(Product product, double volume) {
        return product.getProductMils().stream().filter(RecommendationEligibility::isAvailableVariant)
                .filter(m -> m.getMil() > 0 && m.getStockQuantity() >= bottles(volume, m.getMil()))
                .min(Comparator.comparingDouble((ProductMil m) -> bottles(volume, m.getMil()) * price(m))
                        .thenComparingInt(ProductMil::getMil).thenComparing(ProductMil::getId))
                .orElseThrow(() -> invalid("Không đủ nguyên liệu cho dung tích đã chọn"));
    }

    public static Map<ProductMil, Integer> requirements(Product product) {
        if (product.getProductCustom() == null || product.getProductCustom().getItems() == null
                || product.getProductCustom().getItems().isEmpty()) throw invalid("Công thức chưa có đủ nguyên liệu để đặt hàng");
        Map<ProductMil, Double> volumes = new HashMap<>();
        for (var item : product.getProductCustom().getItems()) {
            var variant = item.getIngredientMil();
            if (variant == null || variant.getProduct() == null || item.getProduct() == null
                    || !Objects.equals(variant.getProduct().getId(), item.getProduct().getId())
                    || variant.getProduct().getFactory() == null || product.getFactory() == null
                    || !Objects.equals(variant.getProduct().getFactory().getId(), product.getFactory().getId())
                    || !variant.isActive() || variant.getProduct().getStatus() != com.nhom10.tmdt.enums.ProductStatus.ACTIVE) {
                throw invalid("Công thức cần được xưởng cập nhật nguyên liệu trước khi đặt hàng");
            }
            volumes.merge(variant, item.getVolumeM1(), Double::sum);
        }
        Map<ProductMil, Integer> required = new HashMap<>();
        volumes.forEach((variant, volume) -> required.put(variant, bottles(volume, variant.getMil())));
        return required;
    }

    private static double price(ProductMil v) { return v.getBasePrice() == null ? v.getPrice() : v.getBasePrice(); }
    private static ResponseStatusException invalid(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
}
