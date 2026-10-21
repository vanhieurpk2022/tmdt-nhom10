package com.nhom10.tmdt.service.productmil;


import com.nhom10.tmdt.dto.product.ProductCreateMilRequest;
import com.nhom10.tmdt.dto.product.ProductCreateMilResponse;
import com.nhom10.tmdt.dto.product.ToggleMilStatusRequest;
import com.nhom10.tmdt.dto.product.ToggleMilStatusResponse;
import com.nhom10.tmdt.model.ProductMil;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface ProductMilService {
    List<ProductMil> productMils(Long productId);
    ProductCreateMilResponse createProductMil(Long productId, ProductCreateMilRequest request);
    void deleteProductMil(Long milId);
    ProductCreateMilResponse updateProductMil(Long productId, Long milId, ProductCreateMilRequest request);
    ToggleMilStatusResponse toggleStatusProductMil(Long productId, Long milId, ToggleMilStatusRequest request);
}
