-- Тренировки
CREATE TABLE trainings (
    id    INTEGER PRIMARY KEY,
    date  DATE NOT NULL
);

--Упраженения
CREATE TABLE exercises (
    id    INTEGER PRIMARY KEY,
    name  TEXT NOT NULL UNIQUE
);

--Подходы
CREATE TABLE sets (
    id           INTEGER PRIMARY KEY,
    training_id  INTEGER NOT NULL REFERENCES trainings(id),
    exercise_id  INTEGER NOT NULL REFERENCES exercises(id),
    weight_kg    NUMERIC(5,1),          -- NULL = без веса (собственный вес)
    reps         INTEGER NOT NULL CHECK (reps > 0),
    started_at   TIMESTAMPTZ NOT NULL,
    finished_at  TIMESTAMPTZ NOT NULL,
    CHECK (finished_at > started_at)
);