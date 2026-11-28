"""Cache vector của mô tả sản phẩm công khai; không lưu hội thoại, giá hay tồn kho."""
import hashlib
import logging
import math
from pathlib import Path
import sqlite3
import struct
import time
from contextlib import closing

logger = logging.getLogger(__name__)


def cache_key(model, text):
    return hashlib.sha256((model + "\0" + text).encode("utf-8")).hexdigest()


def connect(path):
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(target, timeout=2)
    try:
        connection.execute("CREATE TABLE IF NOT EXISTS vectors (key TEXT PRIMARY KEY, value BLOB NOT NULL, used REAL NOT NULL)")
    except sqlite3.Error:
        connection.close()
        raise
    return connection


def get_vectors(path, model, texts):
    if not path or not texts:
        return {}
    found = {}
    try:
        with closing(connect(path)) as connection, connection:
            for text in texts:
                key = cache_key(model, text)
                row = connection.execute("SELECT value FROM vectors WHERE key=?", (key,)).fetchone()
                if row is None or not row[0] or len(row[0]) % 4:
                    continue
                vector = list(struct.unpack(f"<{len(row[0]) // 4}f", row[0]))
                if all(math.isfinite(number) for number in vector):
                    found[text] = vector
                    connection.execute("UPDATE vectors SET used=? WHERE key=?", (time.time(), key))
    except (OSError, sqlite3.Error, struct.error):
        logger.warning("Không đọc được cache vector; sẽ tạo lại vector trong RAM")
    return found


def save_vectors(path, model, vectors, max_entries=1024):
    if not path or not vectors:
        return
    try:
        with closing(connect(path)) as connection, connection:
            now = time.time()
            for text, vector in vectors.items():
                packed = struct.pack(f"<{len(vector)}f", *vector)
                connection.execute("INSERT OR REPLACE INTO vectors VALUES (?, ?, ?)", (cache_key(model, text), packed, now))
            connection.execute("DELETE FROM vectors WHERE key NOT IN (SELECT key FROM vectors ORDER BY used DESC LIMIT ?)", (max_entries,))
    except (OSError, sqlite3.Error, struct.error, OverflowError):
        logger.warning("Không ghi được cache vector; vẫn dùng vector trong RAM")
