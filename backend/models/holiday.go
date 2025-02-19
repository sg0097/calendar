// models/holiday.go
package models

import "go.mongodb.org/mongo-driver/bson/primitive"

// Holiday represents a holiday document.
type Holiday struct {
    ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
    Date        string             `bson:"date" json:"date"` // e.g., "2024-07-04"
    Name        string             `bson:"name" json:"name"`
    Description string             `bson:"description" json:"description"`
}
