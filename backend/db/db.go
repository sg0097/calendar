// db/db.go
package db

import (
    "context"
    "log"
    "time"

    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

// Connect establishes a connection to MongoDB.
func Connect(uri string) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
    if err != nil {
        log.Fatal("Error connecting to MongoDB:", err)
    }
    // Optionally, ping the database to check the connection.
    if err = client.Ping(ctx, nil); err != nil {
        log.Fatal("MongoDB ping failed:", err)
    }
    Client = client
}

// GetHolidayCollection returns the collection where holidays are stored.
func GetHolidayCollection() *mongo.Collection {
    return Client.Database("holidaydb").Collection("holidays")
}
