package main

import (
	"fmt"

	"backend/internal/config"
	"backend/internal/routes"

)

func main() {

	cfg := config.LoadConfig()
	dsn := cfg.GetDSN()
	config.InitDB(dsn)

	r := routes.SetupRouter()
	
	port := cfg.Port
	if port == "" {
		port = "3000"
	}
	
	fmt.Printf("Movie API Server is starting on port %s...\n", port)
	r.Run(":" + port)
}