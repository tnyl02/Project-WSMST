package controllers

import (
	"context"
	"fmt"
	"net/http"
	"backend/internal/config"

	"github.com/gin-gonic/gin"
)

func GetMovies(c *gin.Context) {
	query := `SELECT id, title, genre, release_year, runtime, language, rating, description, image_url FROM movies ORDER BY id ASC`
	rows, err := config.DB.Query(context.Background(), query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Query Failed: " + err.Error()})
		return
	}
	defer rows.Close()

	userPlanRaw, exists := c.Get("userPlan")
	userPlan := ""
	if exists {
		userPlan = userPlanRaw.(string)
	}

	var results []map[string]interface{}

	for rows.Next() {
		var id int
		var title, genre, language, description, imageURL interface{}
		var releaseYear, runtime interface{}
		var rating interface{}

		err := rows.Scan(&id, &title, &genre, &releaseYear, &runtime, &language, &rating, &description, &imageURL)
		if err != nil {
			fmt.Println("Scan Error detected:", err)
			continue
		}

		var movie map[string]interface{}

		if userPlan == "free" {
			movie = map[string]interface{}{
				"id":           id,
				"title":        title,
				"genre":        genre,
				"release_year": releaseYear,
				"runtime":      runtime,
			}
		} else {
			movie = map[string]interface{}{
				"id":           id,
				"title":        title,
				"genre":        genre,
				"release_year": releaseYear,
				"runtime":      runtime,
				"language":     language,
				"rating":       rating,
				"description":  description,
				"image_url":    imageURL,
			}
		}

		results = append(results, movie)
	}

	fmt.Printf("Query successful. Found %d movies.\n", len(results))

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   results,
	})
}
func GetMovieByID(c *gin.Context) {
    id := c.Param("id")
    query := `SELECT id, title, genre, release_year, runtime, language, rating, description, image_url FROM movies WHERE id = $1`
    
    var idVal int
    var title, genre, releaseYear, runtime, language, rating, description, imageURL interface{}

    err := config.DB.QueryRow(context.Background(), query, id).Scan(
        &idVal, &title, &genre, &releaseYear, &runtime, &language, &rating, &description, &imageURL,
    )
    
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลหนังเรื่องนี้"})
        return
    }

    userPlanRaw, exists := c.Get("userPlan")
    userPlan := ""
    if exists {
        userPlan = userPlanRaw.(string)
    }

    if userPlan == "free" {
        c.JSON(http.StatusOK, gin.H{
            "status": "success", 
            "data": map[string]interface{}{
                "id":           idVal,
                "title":        title,
                "genre":        genre,
                "release_year": releaseYear,
                "runtime":      runtime,
            },
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "status": "success", 
        "data": map[string]interface{}{
            "id":           idVal,
            "title":        title,
            "genre":        genre,
            "release_year": releaseYear,
            "runtime":      runtime,
            "language":     language,
            "rating":       rating,
            "description":  description,
            "image_url":    imageURL,
        },
    })
}
func GetMoviesByGenre(c *gin.Context) {
	genreParam := c.Param("genre") 

	query := `SELECT id, title, genre, release_year, runtime, language, rating, description, image_url 
	          FROM movies 
	          WHERE genre ILIKE $1`
	
	searchPattern := "%" + genreParam + "%"
	rows, err := config.DB.Query(context.Background(), query, searchPattern)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลหนังได้"})
		return
	}
	defer rows.Close()

	userPlanRaw, exists := c.Get("userPlan")
	userPlan := ""
	if exists {
		userPlan = userPlanRaw.(string)
	}

	var results []map[string]interface{}

	for rows.Next() {
		var id int
		var title, genre, language, description, imageURL interface{}
		var releaseYear, runtime interface{}
		var rating interface{}

		if err := rows.Scan(&id, &title, &genre, &releaseYear, &runtime, &language, &rating, &description, &imageURL); err == nil {

			var movie map[string]interface{}

			if userPlan == "free" {
				movie = map[string]interface{}{
					"id":           id,
					"title":        title,
					"genre":        genre,
					"release_year": releaseYear,
					"runtime":      runtime,
				}
			} else {
				movie = map[string]interface{}{
					"id":           id,
					"title":        title,
					"genre":        genre,
					"release_year": releaseYear,
					"runtime":      runtime,
					"language":     language,
					"rating":       rating,
					"description":  description,
					"image_url":    imageURL,
				}
			}

			results = append(results, movie)
		}
	}

	if results == nil {
		results = []map[string]interface{}{}
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   results,
	})
}