package com.nhom10.tmdt.service.productmil;

import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.dto.product.ProductCreateMilRequest;
import com.nhom10.tmdt.dto.product.ProductCreateMilResponse;
import com.nhom10.tmdt.dto.product.ToggleMilStatusRequest;
import com.nhom10.tmdt.dto.product.ToggleMilStatusResponse;
import com.nhom10.tmdt.enums.ErrorCode;
import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.model.ProductImage;
import com.nhom10.tmdt.model.ProductMil;
import com.nhom10.tmdt.repo.ProductImageRepository;
import com.nhom10.tmdt.repo.ProductMilRepository;
import com.nhom10.tmdt.repo.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductMilServiceImp implements ProductMilService{
    private final ProductMilRepository productMilRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    @Override
    public List<ProductMil> productMils(Long productId) {
        return productMilRepository.findByProductId((productId));
    }

    @Override
    @Transactional
    public ProductCreateMilResponse createProductMil(Long productId, ProductCreateMilRequest request) {
        Product product = productRepository.getReferenceById(productId);
        ProductMil productMil = ProductMil.builder()
                .mil(request.mil())
                .price(request.price())
                .basePrice(request.basePrice())
                .stockQuantity(request.stockQuantity())
                .product(product)
                .build();
        productMilRepository.save(productMil);

        return ProductCreateMilResponse.builder()
                .id(productMil.getId())
                .mil(request.mil())
                .price(request.price())
                .basePrice(request.basePrice())
                .stockQuantity(request.stockQuantity())
                .build();
    }

    @Override
    @Transactional
    public void deleteProductMil( Long milId) {
        if (!productMilRepository.existsById(milId)) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }
        productMilRepository.deleteById(milId);
    }

    @Override
    public ToggleMilStatusResponse toggleStatusProductMil(Long productId, Long milId, ToggleMilStatusRequest request) {
        ProductMil productMil = productMilRepository.findByProductIdAndId(productId,milId).orElseThrow(()->new AppException(ErrorCode.NOT_FOUND));
        productMil.setActive(request.isActive());
        productMilRepository.save(productMil);
        return ToggleMilStatusResponse.builder()
                .mil(productMil.getMil())
                .price(productMil.getPrice())
                .basePrice(productMil.getBasePrice())
                .stockQuantity(productMil.getStockQuantity())
                .isActive(request.isActive())
                .build();
    }
    @Override
public ProductCreateMilResponse updateProductMil(Long productId, Long milId, ProductCreateMilRequest request) {
    ProductMil productMil = productMilRepository.findByProductIdAndId(productId, milId)
            .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
    
    productMil.setMil(request.mil());
    productMil.setPrice(request.price());
    productMil.setBasePrice(request.basePrice());
    productMil.setStockQuantity(request.stockQuantity());
    productMilRepository.save(productMil);

    return ProductCreateMilResponse.builder()
            .id(productMil.getId())
            .mil(productMil.getMil())
            .price(productMil.getPrice())
            .basePrice(productMil.getBasePrice())
            .stockQuantity(productMil.getStockQuantity())
            .isActive(productMil.isActive())
            .build();
}

}
