import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path

from app.vector_cache import get_vectors, save_vectors


class VectorCacheTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = str(Path(self.directory.name) / "vectors.sqlite3")

    def test_persists_vectors_and_invalidates_changed_model_or_description(self):
        save_vectors(self.path, "model:digest1", {"old description": [0.25, 0.5]})
        self.assertEqual({"old description": [0.25, 0.5]}, get_vectors(self.path, "model:digest1", ["old description"]))
        self.assertEqual({}, get_vectors(self.path, "model:digest2", ["old description"]))
        self.assertEqual({}, get_vectors(self.path, "model:digest1", ["new description"]))

    def test_corrupt_cache_is_nonfatal(self):
        Path(self.path).write_text("not a sqlite database", encoding="utf-8")
        with self.assertLogs("app.vector_cache", level="WARNING"):
            self.assertEqual({}, get_vectors(self.path, "model", ["description"]))
            save_vectors(self.path, "model", {"description": [1.0]})

    def test_cache_has_a_bounded_number_of_entries(self):
        save_vectors(self.path, "model", {f"doc{i}": [float(i)] for i in range(10)}, max_entries=3)
        with closing(sqlite3.connect(self.path)) as connection:
            self.assertEqual(3, connection.execute("SELECT COUNT(*) FROM vectors").fetchone()[0])
