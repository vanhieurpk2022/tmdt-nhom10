package com.nhom10.tmdt;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class TmdtApplication {

	public static void main(String[] args) {
		loadDotenv();
		SpringApplication.run(TmdtApplication.class, args);
	}

	private static void loadDotenv() {
		loadDotenvFrom(Path.of("."));
		loadDotenvFrom(Path.of("backend"));
	}

	private static void loadDotenvFrom(Path directory) {
		if (!Files.isDirectory(directory)) {
			return;
		}

		Dotenv dotenv = Dotenv.configure()
				.directory(directory.toString())
				.ignoreIfMissing()
				.load();

		dotenv.entries().forEach(entry -> {
			if (System.getenv(entry.getKey()) == null && System.getProperty(entry.getKey()) == null) {
				System.setProperty(entry.getKey(), entry.getValue());
			}
		});
	}
}
