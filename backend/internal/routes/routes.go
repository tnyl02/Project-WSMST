package routes

import (
	"backend/internal/controllers"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRouter 
func SetupRouter() *gin.Engine {

	r := gin.Default()

	authGroup := r.Group("/api/auth")
	{
		authGroup.POST("/register", controllers.Register)
		authGroup.POST("/login", controllers.Login)
	}

	movieGroup := r.Group("/api/movies")
	movieGroup.Use(middleware.APIKeyMiddleware()) 
    movieGroup.Use(middleware.RateLimitMiddleware())
	{
		movieGroup.GET("/", controllers.GetMovies)
		movieGroup.GET("/:id", controllers.GetMovieByID)
		movieGroup.GET("/genre/:genre", controllers.GetMoviesByGenre)
	}

	userGroup := r.Group("/api/user")
	userGroup.Use(middleware.AuthMiddleware()) 
	{
		userGroup.GET("/profile", controllers.GetProfile)
		userGroup.PUT("/profile", controllers.UpdateProfile)
	}

	keyGroup := r.Group("/api/key")
	keyGroup.Use(middleware.AuthMiddleware()) 
	{
		keyGroup.GET("/", controllers.GetKeyDetails)         
		keyGroup.POST("/regenerate", controllers.RegenerateKey) 
		keyGroup.POST("/revoke", controllers.RevokeKey)        
	}

	dashboardGroup := r.Group("/api")
	dashboardGroup.Use(middleware.AuthMiddleware())
	{
		dashboardGroup.GET("/dashboard/stats", controllers.GetDashboardStats)
		dashboardGroup.GET("/logs", controllers.GetUsageLogs)
	}

	subGroup := r.Group("/api/subscription")
	subGroup.Use(middleware.AuthMiddleware()) 
	{
		subGroup.POST("/upgrade", controllers.UpgradeSubscription)
	}
	
	adminGroup := r.Group("/api/admin")
	adminGroup.Use(middleware.AuthMiddleware(), middleware.RequireAdmin())
	{
		adminGroup.GET("/test", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "ยินดีต้อนรับท่าน Admin! ระบบตรวจพบสิทธิ์ของคุณเรียบร้อยแล้ว",
			})
		})
	}

	return r
}