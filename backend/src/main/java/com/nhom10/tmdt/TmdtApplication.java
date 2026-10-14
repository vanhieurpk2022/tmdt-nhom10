package com.nhom10.tmdt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

@SpringBootApplication
public class TmdtApplication {

	public static void main(String[] args) {
		SpringApplication application = new SpringApplication(TmdtApplication.class);
		Map<String, Object> dotenvProperties = loadDotenv();
		application.addInitializers(context -> context.getEnvironment()
				.getPropertySources()
				.addFirst(new MapPropertySource("localDotenv", dotenvProperties)));
		application.run(args);
	}

	public static Map<String, Object> loadDotenv() {
		Map<String, Object> properties = new LinkedHashMap<>();
		loadDotenvFrom(Path.of("."), properties);
		loadDotenvFrom(Path.of("backend"), properties);
		return properties;
	}

	private static void loadDotenvFrom(Path directory, Map<String, Object> properties) {
		Path envPath = directory.resolve(".env");
		if (!Files.isRegularFile(envPath)) {
			return;
		}

		try {
			Files.readAllLines(envPath).stream()
					.map(String::trim)
					.filter(line -> !line.isBlank() && !line.startsWith("#"))
					.forEach(line -> setDotenvProperty(line, properties));
		} catch (IOException exception) {
			throw new IllegalStateException("Khong doc duoc file .env: " + envPath, exception);
		}
	}

	private static void setDotenvProperty(String line, Map<String, Object> properties) {
		int separatorIndex = line.indexOf('=');
		if (separatorIndex <= 0) {
			return;
		}

		String key = line.substring(0, separatorIndex).trim();
		String value = stripQuotes(line.substring(separatorIndex + 1).trim());
		properties.put(key, value);
		properties.put(toSpringPropertyKey(key), value);
		properties.put(toSpringKebabPropertyKey(key), value);
	}

	private static String stripQuotes(String value) {
		if (value.length() >= 2
				&& ((value.startsWith("\"") && value.endsWith("\""))
				|| (value.startsWith("'") && value.endsWith("'")))) {
			return value.substring(1, value.length() - 1);
		}
		return value;
	}

	private static String toSpringPropertyKey(String key) {
		return key.toLowerCase().replace('_', '.');
	}

	private static String toSpringKebabPropertyKey(String key) {
		String lowerKey = key.toLowerCase();
		int firstSeparatorIndex = lowerKey.indexOf('_');
		if (firstSeparatorIndex < 0) {
			return lowerKey;
		}

		return lowerKey.substring(0, firstSeparatorIndex)
				+ "."
				+ lowerKey.substring(firstSeparatorIndex + 1).replace('_', '-');
	}
}
