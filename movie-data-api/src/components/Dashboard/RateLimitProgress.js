import React from 'react';

const RateLimitProgress = ({ limits }) => {
  return (
    <div className="rate-limit-container">
      {limits?.map((item, index) => (
        <div key={index} className="progress-item">
          <div className="progress-info">
            <span>{item.label}</span>
            <span>{item.current} / {item.max}</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-fill" 
              style={{ width: `${(item.current / item.max) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// *** สำคัญมาก: ต้องมีบรรทัดนี้ด้านล่างสุดของไฟล์ ***
export default RateLimitProgress;