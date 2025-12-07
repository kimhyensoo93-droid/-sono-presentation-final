/* ============================================
   대명상조 더해피450 프레젠테이션 JavaScript
   슬라이드 네비게이션 및 인터랙션
   ============================================ */

(function() {
    'use strict';
    
    // 슬라이드 요소들
    const slides = document.querySelectorAll('.slide');
    const progressFill = document.querySelector('.progress-fill');
    const totalSlides = slides.length;
    let currentSlide = 0;
    
    // 초기화
    function init() {
        if (slides.length === 0) return;
        
        // 첫 번째 슬라이드 활성화
        showSlide(0);
        
        // 이벤트 리스너 등록
        document.addEventListener('keydown', handleKeyPress);
        document.addEventListener('wheel', handleWheel, { passive: false });
        
        // 터치 이벤트 (모바일)
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }
        
        // 클릭 이벤트
        document.addEventListener('click', function(e) {
            const width = window.innerWidth;
            const clickX = e.clientX;
            
            // 왼쪽 1/3 클릭 시 이전 슬라이드
            if (clickX < width / 3) {
                prevSlide();
            }
            // 오른쪽 1/3 클릭 시 다음 슬라이드
            else if (clickX > (width * 2 / 3)) {
                nextSlide();
            }
        });
    }
    
    // 슬라이드 표시
    function showSlide(index) {
        // 범위 체크
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;
        
        // 모든 슬라이드 숨김
        slides.forEach(function(slide) {
            slide.classList.remove('active', 'prev');
        });
        
        // 현재 슬라이드 표시
        slides[index].classList.add('active');
        
        // 이전 슬라이드 표시 (애니메이션용)
        if (index > 0) {
            slides[index - 1].classList.add('prev');
        }
        
        // 진행바 업데이트
        const progress = ((index + 1) / totalSlides) * 100;
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        currentSlide = index;
        
        // URL 업데이트 (페이지 새로고침 없이)
        if (history.pushState) {
            const newUrl = window.location.pathname + '?slide=' + (index + 1);
            history.pushState({ slide: index }, '', newUrl);
        }
    }
    
    // 다음 슬라이드
    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            showSlide(currentSlide + 1);
        }
    }
    
    // 이전 슬라이드
    function prevSlide() {
        if (currentSlide > 0) {
            showSlide(currentSlide - 1);
        }
    }
    
    // 키보드 이벤트 핸들러
    function handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                prevSlide();
                break;
            case 'Home':
                e.preventDefault();
                showSlide(0);
                break;
            case 'End':
                e.preventDefault();
                showSlide(totalSlides - 1);
                break;
            case 'Escape':
                // 전체화면 종료
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                break;
            case 'f':
            case 'F':
                // 전체화면 토글
                toggleFullscreen();
                break;
        }
    }
    
    // 마우스 휠 이벤트 핸들러
    let wheelTimeout;
    function handleWheel(e) {
        e.preventDefault();
        
        // 휠 이벤트 디바운싱 (너무 빠른 스크롤 방지)
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(function() {
            if (e.deltaY > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }, 50);
    }
    
    // 전체화면 토글
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(function(err) {
                console.log('전체화면 오류:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
    
    // URL 파라미터로 슬라이드 번호 확인
    function getSlideFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const slideParam = urlParams.get('slide');
        if (slideParam) {
            const slideIndex = parseInt(slideParam) - 1;
            if (slideIndex >= 0 && slideIndex < totalSlides) {
                return slideIndex;
            }
        }
        return 0;
    }
    
    // 브라우저 뒤로가기/앞으로가기 버튼 지원
    window.addEventListener('popstate', function(e) {
        if (e.state && typeof e.state.slide !== 'undefined') {
            showSlide(e.state.slide);
        } else {
            const slideIndex = getSlideFromUrl();
            showSlide(slideIndex);
        }
    });
    
    // 페이지 로드 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            const startSlide = getSlideFromUrl();
            currentSlide = startSlide;
            init();
        });
    } else {
        const startSlide = getSlideFromUrl();
        currentSlide = startSlide;
        init();
    }
    
    // 인쇄 이벤트 감지
    window.addEventListener('beforeprint', function() {
        // 인쇄 시 모든 슬라이드 표시
        slides.forEach(function(slide) {
            slide.classList.add('active');
        });
    });
    
    window.addEventListener('afterprint', function() {
        // 인쇄 후 원래 상태로 복원
        slides.forEach(function(slide) {
            slide.classList.remove('active', 'prev');
        });
        showSlide(currentSlide);
    });
    
})();
