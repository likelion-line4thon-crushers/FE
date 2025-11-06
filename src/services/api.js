// src/services/api.js
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

// 요청 인터셉터: FormData 처리
api.interceptors.request.use(
    (config) => {
        // FormData를 보낼 때는 Content-Type 헤더를 제거하여 axios가 자동으로 boundary를 설정하도록 함
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
            console.log(" [API Interceptor] FormData 감지 - Content-Type 헤더 제거 (자동 boundary 설정)");
            
            // FormData 필드명 확인
            const entries = Array.from(config.data.entries());
            const fieldNames = [...new Set(entries.map(([key]) => key))];
            console.log(" [API Interceptor] FormData 필드명:", fieldNames);
        }
        
        return config;
    },
    (error) => {
        console.error("[API 요청 에러]", error);
        return Promise.reject(error);
    }
);

export default api;
