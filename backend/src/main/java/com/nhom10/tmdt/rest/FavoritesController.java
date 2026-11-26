package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.product.ProductCardResponse;
import com.nhom10.tmdt.model.WishList;
import com.nhom10.tmdt.repo.*;
import com.nhom10.tmdt.service.imp.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;
import java.util.List;

@RestController @RequestMapping("/favorites") @RequiredArgsConstructor
public class FavoritesController {
    private final WishListRepository favorites;
    private final UserRepository users;
    private final ProductRepository products;
    private final ProductService catalog;

    @GetMapping @Transactional(readOnly = true)
    public ApiResponse<List<ProductCardResponse>> list(Principal principal) {
        return new ApiResponse<>(200, "Sản phẩm yêu thích", favorites.findByUserEmailOrderByIdDesc(principal.getName()).stream()
                .map(WishList::getProduct).filter(RecommendationEligibility::isPublic).distinct().map(catalog::toCard).toList());
    }

    @PutMapping("/{id}") @Transactional
    public ApiResponse<Void> add(@PathVariable Long id, Principal principal) {
        var user = users.lockByEmail(principal.getName()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        var product = products.findById(id).filter(RecommendationEligibility::isPublic)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm đang mở bán"));
        if (!favorites.existsByUserEmailAndProductId(principal.getName(), id)) {
            favorites.save(WishList.builder().user(user).product(product).build());
        }
        return new ApiResponse<>(200, "Đã lưu sản phẩm yêu thích");
    }

    @DeleteMapping("/{id}") @Transactional
    public ApiResponse<Void> remove(@PathVariable Long id, Principal principal) {
        users.lockByEmail(principal.getName()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        favorites.deleteByUserEmailAndProductId(principal.getName(), id);
        return new ApiResponse<>(200, "Đã bỏ yêu thích");
    }
}
