package controllers

import (
	"context"
	"net/http"
	"backend/internal/config"

	"github.com/gin-gonic/gin"
)

// /api/admin/users
func GetAllUsers(c *gin.Context) {
	
query := `
		SELECT 
			id, 
			COALESCE(username, 'ไม่มีชื่อ'), 
			COALESCE(email, 'ไม่มีอีเมล'), 
			COALESCE(plan, 'free'), 
			COALESCE(role, 'user') 
		FROM users 
		WHERE role != 'admin' OR role IS NULL
		ORDER BY id ASC
	`
	rows, err := config.DB.Query(context.Background(), query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูล User ได้"})
		return
	}
	defer rows.Close()

	var users []map[string]interface{}
	for rows.Next() {
		var id int
		var username, email, plan, role string
		
		err := rows.Scan(&id, &username, &email, &plan, &role)
		
		if err == nil {
			users = append(users, map[string]interface{}{
				"id": id, "username": username, "email": email, "plan": plan, "role": role,
			})
		} else {
			
			c.Set("ScanError", err.Error())
		}
	}
	
	if users == nil {
		users = []map[string]interface{}{}
	}
	c.JSON(http.StatusOK, gin.H{"users": users})
}

// /api/admin/users/:id/role
func UpdateUserRole(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Role string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาส่ง role มาด้วย (เช่น 'admin' หรือ 'user')"})
		return
	}

	_, err := config.DB.Exec(context.Background(), "UPDATE users SET role = $1 WHERE id = $2", input.Role, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตสิทธิ์ไม่สำเร็จ"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "อัปเดตสิทธิ์เป็น " + input.Role + " สำเร็จ"})
}

// /api/admin/users/:id/plan
func UpdateUserPlan(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Plan string `json:"plan" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาส่ง plan มาด้วย (free, medium, premium)"})
		return
	}

	_, err := config.DB.Exec(context.Background(), "UPDATE users SET plan = $1 WHERE id = $2", input.Plan, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตแพ็กเกจไม่สำเร็จ"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "อัปเดตแพ็กเกจเป็น " + input.Plan + " สำเร็จ"})
}

///api/admin/users/:id
func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	config.DB.Exec(context.Background(), `DELETE FROM usage_logs WHERE api_key_id IN (SELECT id FROM api_keys WHERE user_id = $1)`, id)
	config.DB.Exec(context.Background(), `DELETE FROM api_keys WHERE user_id = $1`, id)
	
	_, err := config.DB.Exec(context.Background(), "DELETE FROM users WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบ User ไม่สำเร็จ"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ลบ User ออกจากระบบสำเร็จ"})
}

type MovieInput struct {
	Title       string  `json:"title" binding:"required"`
	Genre       string  `json:"genre"`
	ReleaseYear int     `json:"release_year"`
	Runtime     int     `json:"runtime"`
	Language    string  `json:"language"`
	Rating      float64 `json:"rating"`
	Description string  `json:"description"`
	ImageURL    string  `json:"image_url"`
}

// /api/admin/movies
func CreateMovie(c *gin.Context) {
	var input MovieInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลหนังไม่ถูกต้อง หรือส่งมาไม่ครบ"})
		return
	}

	query := `INSERT INTO movies (title, genre, release_year, runtime, language, rating, description, image_url) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`
	
	var newID int
	err := config.DB.QueryRow(context.Background(), query, input.Title, input.Genre, input.ReleaseYear, input.Runtime, input.Language, input.Rating, input.Description, input.ImageURL).Scan(&newID)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เพิ่มหนังลง Database ไม่สำเร็จ"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "เพิ่มหนังใหม่สำเร็จ", "movie_id": newID})
}

//  /api/admin/movies/:id
func UpdateMovie(c *gin.Context) {
	id := c.Param("id")
	var input MovieInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลหนังไม่ถูกต้อง"})
		return
	}

	query := `UPDATE movies SET title=$1, genre=$2, release_year=$3, runtime=$4, language=$5, rating=$6, description=$7, image_url=$8 WHERE id=$9`
	_, err := config.DB.Exec(context.Background(), query, input.Title, input.Genre, input.ReleaseYear, input.Runtime, input.Language, input.Rating, input.Description, input.ImageURL, id)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "แก้ไขข้อมูลหนังไม่สำเร็จ"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "แก้ไขข้อมูลหนังสำเร็จ"})
}

// DELETE /api/admin/movies/:id
func DeleteMovie(c *gin.Context) {
	id := c.Param("id")
	_, err := config.DB.Exec(context.Background(), "DELETE FROM movies WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบหนังไม่สำเร็จ"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ลบหนังออกจากระบบสำเร็จ"})
}

//  /api/admin/dashboard/stats
func GetAdminSystemStats(c *gin.Context) {
	var totalUsers, totalMovies, totalRequestsToday int

	userQuery := `SELECT COUNT(*) FROM users WHERE role != 'admin' OR role IS NULL`
	config.DB.QueryRow(context.Background(), userQuery).Scan(&totalUsers)

	config.DB.QueryRow(context.Background(), "SELECT COUNT(*) FROM movies").Scan(&totalMovies)

	requestQuery := `SELECT COUNT(*) FROM usage_logs WHERE DATE(accessed_at) = CURRENT_DATE`
	config.DB.QueryRow(context.Background(), requestQuery).Scan(&totalRequestsToday)

	c.JSON(http.StatusOK, gin.H{
		"total_users":          totalUsers,
		"total_movies":         totalMovies,
		"total_requests_today": totalRequestsToday,
	})
}