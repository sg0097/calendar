// handlers/holiday.go
package handlers

import (
    "context"
    "encoding/json"
    "net/http"
    "time"

    "github.com/gorilla/mux"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"

    "github.com/sg0097/backend/db"     // adjust module path accordingly
    "github.com/sg0097/backend/models" // adjust module path accordingly
)

// CreateHoliday handles POST /api/holidays
func CreateHoliday(w http.ResponseWriter, r *http.Request) {
    var holiday models.Holiday
    if err := json.NewDecoder(r.Body).Decode(&holiday); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    collection := db.GetHolidayCollection()
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    result, err := collection.InsertOne(ctx, holiday)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    holiday.ID = result.InsertedID.(primitive.ObjectID)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(holiday)
}

// ListHolidays handles GET /api/holidays
func ListHolidays(w http.ResponseWriter, r *http.Request) {
    collection := db.GetHolidayCollection()
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    // Optionally, add filters based on query parameters
    filter := bson.D{}
    cur, err := collection.Find(ctx, filter)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer cur.Close(ctx)

    var holidays []models.Holiday
    for cur.Next(ctx) {
        var holiday models.Holiday
        if err := cur.Decode(&holiday); err != nil {
            continue
        }
        holidays = append(holidays, holiday)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(holidays)
}

// DeleteHoliday handles DELETE /api/holidays/{id}
func DeleteHoliday(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := primitive.ObjectIDFromHex(vars["id"])
    if err != nil {
        http.Error(w, "Invalid ID", http.StatusBadRequest)
        return
    }

    collection := db.GetHolidayCollection()
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    res, err := collection.DeleteOne(ctx, bson.M{"_id": id})
    if err != nil || res.DeletedCount == 0 {
        http.Error(w, "Holiday not found", http.StatusNotFound)
        return
    }
    w.WriteHeader(http.StatusNoContent)
}
