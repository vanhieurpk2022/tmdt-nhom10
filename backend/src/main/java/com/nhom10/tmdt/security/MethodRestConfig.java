package com.nhom10.tmdt.security;

import com.nhom10.tmdt.model.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.Type;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Configuration
@RequiredArgsConstructor
public class MethodRestConfig implements RepositoryRestConfigurer {


    private final EntityManager entityManager;

    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        // expose ids
        // Cho phép trả về id
        config.exposeIdsFor(entityManager.getMetamodel().getEntities().stream().map(Type::getJavaType).toArray(Class[]::new));

        // Chặn method của entity cụ thể
        // User: chặn POST (tạo), PUT/PATCH (sửa), DELETE (xóa)
        blockHttpMethods(User.class, config,
                HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH, HttpMethod.DELETE);

        // CORS configuration
        cors.addMapping("/**")
                .allowedOrigins(Endpoints.HOST)
                .allowedMethods("GET", "POST", "PUT", "DELETE");


    }
    private void blockHttpMethods(Class<?> entityClass,
                                  RepositoryRestConfiguration config,
                                  HttpMethod... methods) {
        config.getExposureConfiguration()
                .forDomainType(entityClass)
                .withItemExposure((metadata, httpMethods) -> httpMethods.disable(methods))
                .withCollectionExposure((metadata, httpMethods) -> httpMethods.disable(methods));
    }
}
