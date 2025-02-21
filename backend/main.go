// main.go
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/joho/godotenv" // Import godotenv for loading .env file
	"github.com/sg0097/backend/db"
	"github.com/sg0097/backend/handlers"
)

func main() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: No .env file found. Using environment variables instead.")
	}

	// Get MongoDB URI from environment variable
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("Error: MONGO_URI is not set in the environment variables")
	}

	// Connect to MongoDB
	db.Connect(mongoURI)

	// Set up the router
	router := mux.NewRouter()

	// Test endpoint
	router.HandleFunc("/api/test", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello, world!"))
	}).Methods("GET")

	// API endpoints
	router.HandleFunc("/api/holidays", handlers.CreateHoliday).Methods("POST")
	router.HandleFunc("/api/holidays", handlers.ListHolidays).Methods("GET")
	router.HandleFunc("/api/holidays/{id}", handlers.DeleteHoliday).Methods("DELETE")

	// Add a catch-all route for OPTIONS requests
	router.PathPrefix("/").Methods("OPTIONS").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Configure CORS using rs/cors package
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"https://calendar-fron-cbkk2c7j1-shivam2.vercel.app/"}, // Allow all origins for development
		AllowedMethods:   []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// Wrap the router with the CORS handler
	handler := c.Handler(router)

	// Set port from environment variable or default to 8089
	port := os.Getenv("PORT")
	if port == "" {
		port = "8089"
	}

	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
