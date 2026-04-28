-- 1. ตารางเก็บข้อมูล User
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    plan VARCHAR(20) DEFAULT 'free',
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางเก็บ API Keys
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    key_string VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางข้อมูลหนัง (Mock Data)
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre TEXT,
    release_year INTEGER,
    runtime INTEGER,       
    language VARCHAR(10),  
    rating DECIMAL(3,1),
    description TEXT,
    image_url TEXT
);

-- 4. ตารางบันทึกการใช้งาน (สำหรับทำ Rate Limit)
CREATE TABLE usage_logs (
    id SERIAL PRIMARY KEY,
    api_key_id INTEGER REFERENCES api_keys(id) ON DELETE CASCADE,
    endpoint VARCHAR(100), 
    status_code INTEGER,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-----------------------------------------------------------
-- 1. สร้าง User จำลอง 3 คน
INSERT INTO users (username, email, password_hash, plan)
VALUES 
('user1_free', 'free@test.com', '1234', 'free'),
('user2_medium', 'medium@test.com', '1234', 'medium'),
('user3_premium', 'premium@test.com', '1234', 'premium');

-- 2. สร้าง API Key ผูกกับ User ทั้ง 3 คน
INSERT INTO api_keys (user_id, key_string)
VALUES 
(1, 'key_free_11111'),
(2, 'key_medium_55555'),
(3, 'key_premium_99999');

INSERT INTO movies (title, genre, release_year, runtime, language, rating, description, image_url)
VALUES 
(
    'City of God', 
    'Drama, Crime', 
    2002, 130, 'pt', 8.1, 
    'Cidade de Deus is a shantytown that started during the 1960s and became one of Rio de Janeiro’s most dangerous places in the beginning of the 1980s. To tell the story of this place, the movie describes the life of various characters, all seen by the point of view of the narrator, Buscapé. Buscapé was raised in a very violent environment. Despite the feeling that all odds were against him, he finds out that life can be seen with other eyes: The eyes of an artist. By accident, he becomes a professional photographer, gaining his freedom.', 
    'https://image.tmdb.org/t/p/w500/pWDSub2pSodZfsSqiG3oCU4Z06r.jpg'
),
(
    'Oldboy', 
    'Drama, Thriller, Mystery, Action', 
    2003, 120, 'ko', 8.0, 
    'With no clue how he came to be imprisoned, drugged and tortured for 15 years, a desperate businessman seeks revenge on his captors.', 
    'https://image.tmdb.org/t/p/w500/6p19S61S6SlS06JvVpG91pS61Sl.jpg'
),
(
    'Howl''s Moving Castle', 
    'Fantasy, Animation, Adventure', 
    2004, 119, 'ja', 8.2, 
    'When Sophie, a shy young woman, is cursed with an old body by a spiteful witch, her only chance of breaking the spell lies with a self-indulgent yet insecure young wizard and his companions in his legged, walking home.', 
    'https://image.tmdb.org/t/p/w500/393ST0uLYpFa6XfG3oCU4Z06r.jpg'
);