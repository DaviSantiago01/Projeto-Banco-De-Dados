package br.com.cesar.projetobd.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Libera o acesso do frontend para as rotas da API.
@Configuration
public class ConfiguracaoWeb implements WebMvcConfigurer {
    private final String origemFrontend;

    public ConfiguracaoWeb(@Value("${app.frontend-origin}") String origemFrontend) {
        this.origemFrontend = origemFrontend;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(origemFrontend.split(","))
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*");
    }
}
