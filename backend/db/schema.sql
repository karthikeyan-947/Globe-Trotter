CREATE TABLE trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  start_date TEXT,
  end_date TEXT
);

CREATE TABLE stops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER,
  city TEXT,
  mode TEXT,
  stay_days INTEGER
);
