package config

import (
    "context"
    "fmt"
    "log"
    "time"

    "github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func InitDB(dsn string) {

    dbConfig, err := pgxpool.ParseConfig(dsn)
    if err != nil {
        log.Fatalf("Unable to parse DSN: %v", err)
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5 * time.Second)
    defer cancel()

    DB, err = pgxpool.NewWithConfig(ctx, dbConfig)
    if err != nil {
        log.Fatalf("Unable to connect to database: %v", err)
    }

    err = DB.Ping(ctx)
    if err != nil {
        log.Fatalf("Database ping failed: %v", err)
    }

    fmt.Println("Successfully connected to Neon PostgreSQL!")
}