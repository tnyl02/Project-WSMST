package controllers

import (
	"context"
	"net/http"
	"time"
	"backend/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("my_super_secret_key_999")

type RegisterInput struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=4"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// 1. REGISTER
func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), 10)

	apiKey := "mov_free_" + input.Username 

	var userID int
	var plan, role string
	
	
	userQuery := `INSERT INTO users (username, email, password_hash, plan) 
	          VALUES ($1, $2, $3, 'free') RETURNING id, plan, role`
	
	err := config.DB.QueryRow(context.Background(), userQuery, input.Username, input.Email, string(hashedPassword)).Scan(&userID, &plan, &role) // [เพิ่ม &role]
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว"})
		return
	}

	keyQuery := `INSERT INTO api_keys (user_id, key_string) VALUES ($1, $2)`
	_, err = config.DB.Exec(context.Background(), keyQuery, userID, apiKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการสร้าง API Key"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "สมัครสมาชิกสำเร็จ",
		"api_key": apiKey,
		"plan":    plan,
		"role":    role,
	})
}

// 2. LOGIN
func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอกข้อมูลให้ครบ"})
		return
	}

	var dbPassword, username, plan, role string 
	var id int
	
	query := `SELECT id, username, password_hash, plan, role FROM users WHERE email = $1`
	err := config.DB.QueryRow(context.Background(), query, input.Email).Scan(&id, &username, &dbPassword, &plan, &role) // [เพิ่ม &role]

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(dbPassword), []byte(input.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"})
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := jwt.MapClaims{
		"user_id": id,
		"email":   input.Email,
		"plan":    plan,
		"role":    role,
		"exp":     expirationTime.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(jwtKey)

	c.JSON(http.StatusOK, gin.H{
		"message": "เข้าสู่ระบบสำเร็จ",
		"token":   tokenString,
		"user": gin.H{
			"id":       id,
			"username": username,
			"plan":     plan,
			"role":     role, 
		},
	})
}

//update
type UpdateProfileInput struct {
	Username string `json:"username"`
	Password string `json:"password" binding:"required,min=4"`
}

func GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id") 

	var username, email, plan, role string 
	
	query := `SELECT username, email, plan, role FROM users WHERE id = $1`
	err := config.DB.QueryRow(context.Background(), query, userID).Scan(&username, &email, &plan, &role) // [เพิ่ม &role]

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "หาข้อมูลไม่พบ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":       userID,
		"username": username,
		"email":    email,
		"plan":     plan,
		"role":     role,
	})
}

// PUT /api/user/profile
func UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่พบข้อมูลผู้ใช้งาน"})
		return
	}

	var input struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบข้อมูลไม่ถูกต้อง"})
		return
	}

	if input.Username == "" && input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาส่ง username หรือ password ที่ต้องการแก้ไข"})
		return
	}

	var err error
	if input.Username != "" && input.Password != "" {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
		_, err = config.DB.Exec(context.Background(), "UPDATE users SET username=$1, password_hash=$2 WHERE id=$3", input.Username, string(hashedPassword), userID)
		
	} else if input.Username != "" {
		_, err = config.DB.Exec(context.Background(), "UPDATE users SET username=$1 WHERE id=$2", input.Username, userID)
		
	} else if input.Password != "" {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
		_, err = config.DB.Exec(context.Background(), "UPDATE users SET password_hash=$1 WHERE id=$2", string(hashedPassword), userID)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "อัปเดตโปรไฟล์ไม่สำเร็จ", 
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "อัปเดตข้อมูลโปรไฟล์สำเร็จเรียบร้อย!"})
}