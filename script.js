// ========== LOCAL STORAGE FOR LIKES - រក្សាទុកចំនួន Like ពេល Refresh ទំព័រ ==========

// បង្កើត ID សម្រាប់ article នីមួយៗ
function generateArticleId(article) {
    // រកមើល title របស់ article
    const titleElement = article.querySelector('h3, .card-title');
    let title = '';
    
    if (titleElement) {
        title = titleElement.innerText.trim();
    } else {
        // ប្រើលេខរៀងបើគ្មាន title
        const index = Array.from(document.querySelectorAll('.news-card, article')).indexOf(article);
        title = `article_${index + 1}`;
    }
    
    // កាត់ខ្លី និងលុបតួអក្សរពិសេស
    return 'article_' + title
        .substring(0, 30)
        .replace(/[^a-zA-Z0-9\u1780-\u17FF]/g, '_')
        .toLowerCase();
}

// រក្សាទុកចំនួន like ក្នុង localStorage
function saveLikeToStorage(button) {
    try {
        // រក article ដែលផ្ទុកប៊ូតុងនេះ
        const article = button.closest('.news-card, article');
        if (!article) return;
        
        // បង្កើត ID សម្រាប់ article
        const articleId = generateArticleId(article);
        
        // រក្សាទុកទិន្នន័យទាំងអស់ក្នុង object តែមួយ
        const articleData = {
            id: articleId,
            title: article.querySelector('h3, .card-title')?.innerText || 'គ្មានចំណងជើង',
            likes: parseInt(button.querySelector('.like-count, span:last-child')?.innerText || '0'),
            liked: true,
            timestamp: new Date().toISOString()
        };
        
        // រក្សាទុកក្នុង localStorage
        localStorage.setItem(`article_${articleId}`, JSON.stringify(articleData));
        
        // រក្សាទុកបញ្ជីរាយនាមផងដែរ
        saveArticleList(articleId);
        
        console.log(`✅ បានរក្សាទុក: ${articleData.title} - ${articleData.likes} likes`);
    } catch (error) {
        console.error('❌ មិនអាចរក្សាទុកទិន្នន័យបានទេ:', error);
    }
}

// រក្សាទុកបញ្ជីរាយនាមអត្ថបទ
function saveArticleList(articleId) {
    try {
        // ទាញយកបញ្ជីរាយនាមចាស់
        let articleList = JSON.parse(localStorage.getItem('all_articles') || '[]');
        
        // បញ្ចូល ID ថ្មីបើមិនទាន់មាន
        if (!articleList.includes(articleId)) {
            articleList.push(articleId);
            localStorage.setItem('all_articles', JSON.stringify(articleList));
        }
    } catch (error) {
        console.error('❌ មិនអាចរក្សាទុកបញ្ជីរាយនាមបានទេ:', error);
    }
}

// ផ្ទុកចំនួន like ពី localStorage
function loadLikesFromStorage() {
    try {
        // ស្វែងរកប៊ូតុង Like ទាំងអស់
        const likeButtons = document.querySelectorAll('.like-button, button[onclick*="likeArticle"]');
        
        likeButtons.forEach(button => {
            const article = button.closest('.news-card, article');
            if (!article) return;
            
            // បង្កើត ID សម្រាប់ article នេះ
            const articleId = generateArticleId(article);
            
            // ទាញយកទិន្នន័យពី localStorage
            const savedData = localStorage.getItem(`article_${articleId}`);
            
            if (savedData) {
                try {
                    const articleData = JSON.parse(savedData);
                    
                    // បង្ហាញចំនួន like
                    const countSpan = button.querySelector('.like-count, span:last-child');
                    if (countSpan && articleData.likes) {
                        countSpan.innerText = articleData.likes;
                    }
                    
                    // បង្ហាញថាបាន Like រួចហើយ
                    if (articleData.liked) {
                        button.classList.add('liked');
                        button.disabled = true;
                        button.style.color = 'red';
                        button.style.backgroundColor = '#ffe6e6';
                        button.style.borderColor = '#ff9999';
                    }
                } catch (e) {
                    console.error('❌ ទិន្នន័យខូច:', e);
                }
            }
        });
        
        console.log('✅ បានផ្ទុកទិន្នន័យ Like រួចរាល់');
    } catch (error) {
        console.error('❌ មិនអាចផ្ទុកទិន្នន័យបានទេ:', error);
    }
}

// មុខងារ Like ដែលប្រើជាមួយ localStorage
function likeArticle(button) {
    try {
        // ស្វែងរក span ដែលផ្ទុកចំនួន like
        let countSpan = button.querySelector('.like-count, span:last-child');
        if (!countSpan) {
            console.error('❌ រកមិនឃើញ span សម្រាប់បង្ហាញចំនួន Like');
            return;
        }
        
        let currentLikes = parseInt(countSpan.innerText) || 0;
        
        // បង្កើនចំនួន Like
        currentLikes += 1;
        countSpan.innerText = currentLikes;
        
        // ផ្លាស់ប្តូរ style
        button.classList.add('liked');
        button.style.color = 'red';
        button.style.backgroundColor = '#ffe6e6';
        button.style.borderColor = '#ff9999';
        button.disabled = true;
        
        // Animation effect
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 200);
        
        // រក្សាទុកទិន្នន័យក្នុង localStorage
        saveLikeToStorage(button);
        
        // បង្ហាញសារជូនដំណឹង
        showNotification('អរគុណសម្រាប់ការចូលចិត្ត! ❤️');
        
    } catch (error) {
        console.error('❌ មានបញ្ហាក្នុងការ Like:', error);
    }
}

// ========== បង្ហាញសារជូនដំណឹង ==========
function showNotification(message) {
    // បង្កើត notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #003366;
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-size: 1rem;
    `;
    notification.innerText = message;
    
    // បន្ថែម animation keyframe
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes fadeOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // បាត់បន្ទាប់ពី 3 វិនាទី
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ========== សម្អាតទិន្នន័យចាស់ ==========
function clearAllLikes() {
    if (confirm('តើអ្នកពិតជាចង់លុបចំនួន Like ទាំងអស់មែនទេ?')) {
        try {
            // លុបទិន្នន័យទាំងអស់ដែលទាក់ទងនឹង likes
            const allArticles = JSON.parse(localStorage.getItem('all_articles') || '[]');
            
            allArticles.forEach(articleId => {
                localStorage.removeItem(`article_${articleId}`);
            });
            
            localStorage.removeItem('all_articles');
            
            // ធ្វើឲ្យប៊ូតុង Like ទាំងអស់ត្រឡប់ដូចដើម
            document.querySelectorAll('.like-button, button[onclick*="likeArticle"]').forEach(button => {
                button.classList.remove('liked');
                button.disabled = false;
                button.style.color = '';
                button.style.backgroundColor = '';
                button.style.borderColor = '';
                
                const countSpan = button.querySelector('.like-count, span:last-child');
                if (countSpan) {
                    countSpan.innerText = '0';
                }
            });
            
            console.log('✅ បានលុបទិន្នន័យ Like ទាំងអស់');
            showNotification('បានលុបចំនួន Like ទាំងអស់ដោយជោគជ័យ');
            
        } catch (error) {
            console.error('❌ មិនអាចលុបទិន្នន័យបានទេ:', error);
            alert('មានបញ្ហាក្នុងការលុបទិន្នន័យ');
        }
    }
}

// ========== បង្ហាញស្ថិតិ ==========
function showLikeStatistics() {
    try {
        const allArticles = JSON.parse(localStorage.getItem('all_articles') || '[]');
        let totalLikes = 0;
        let totalArticles = 0;
        
        console.log('📊 ===== ស្ថិតិ Like =====');
        
        allArticles.forEach(articleId => {
            const data = localStorage.getItem(`article_${articleId}`);
            if (data) {
                const articleData = JSON.parse(data);
                totalLikes += articleData.likes || 0;
                totalArticles++;
                
                console.log(`   📰 ${articleData.title}: ${articleData.likes} likes`);
            }
        });
        
        console.log('   --------------------');
        console.log(`   📊 អត្ថបទសរុប: ${totalArticles}`);
        console.log(`   ❤️  ចំនួន Like សរុប: ${totalLikes}`);
        console.log(`   📈 មធ្យមភាគ: ${totalArticles ? (totalLikes / totalArticles).toFixed(1) : 0} likes/អត្ថបទ`);
        console.log('   ====================');
        
        return {
            totalArticles,
            totalLikes,
            average: totalArticles ? totalLikes / totalArticles : 0
        };
    } catch (error) {
        console.error('❌ មិនអាចបង្ហាញស្ថិតិបានទេ:', error);
    }
}

// ========== នាំចេញទិន្នន័យ ==========
function exportLikesData() {
    try {
        const allArticles = JSON.parse(localStorage.getItem('all_articles') || '[]');
        const exportData = {
            exportDate: new Date().toISOString(),
            totalArticles: allArticles.length,
            articles: []
        };
        
        allArticles.forEach(articleId => {
            const data = localStorage.getItem(`article_${articleId}`);
            if (data) {
                exportData.articles.push(JSON.parse(data));
            }
        });
        
        // បង្កើតឯកសារ JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        // ទាញយកឯកសារ
        const link = document.createElement('a');
        link.href = url;
        link.download = `likes_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        showNotification('បាននាំចេញទិន្នន័យដោយជោគជ័យ! 📥');
        
    } catch (error) {
        console.error('❌ មិនអាចនាំចេញទិន្នន័យបានទេ:', error);
    }
}

// ========== នាំចូលទិន្នន័យ ==========
function importLikesData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.articles && Array.isArray(importedData.articles)) {
                importedData.articles.forEach(articleData => {
                    if (articleData.id) {
                        localStorage.setItem(`article_${articleData.id}`, JSON.stringify(articleData));
                        saveArticleList(articleData.id);
                    }
                });
                
                showNotification('បាននាំចូលទិន្នន័យដោយជោគជ័យ! 📤');
                loadLikesFromStorage(); // ផ្ទុកទិន្នន័យថ្មី
            }
        } catch (error) {
            console.error('❌ ទិន្នន័យមិនត្រឹមត្រូវ:', error);
            alert('ឯកសារនេះមិនមែនជាទិន្នន័យត្រឹមត្រូវទេ');
        }
    };
    reader.readAsText(file);
}

// ========== កំណត់ពេលវេលា Like ==========
function getLikeTime(articleId) {
    const data = localStorage.getItem(`article_${articleId}`);
    if (data) {
        const articleData = JSON.parse(data);
        return articleData.timestamp;
    }
    return null;
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 កំពុងផ្ទុកប្រព័ន្ធ Like...');
    
    // ផ្ទុកចំនួន Like ពី localStorage
    loadLikesFromStorage();
    
    // បង្ហាញស្ថិតិក្នុង console
    setTimeout(() => {
        showLikeStatistics();
    }, 500);
    
    // បន្ថែមប៊ូតុងគ្រប់គ្រងទិន្នន័យ (សម្រាប់អ្នកអភិវឌ្ឍន៍)
    window.clearAllLikes = clearAllLikes;
    window.showLikeStats = showLikeStatistics;
    window.exportLikesData = exportLikesData;
    window.importLikesData = importLikesData;
    
    console.log('✅ ប្រព័ន្ធ Like បានផ្ទុករួចរាល់!');
    console.log('📌 ពាក្យបញ្ជា៖');
    console.log('   - showLikeStats()    : បង្ហាញស្ថិតិ');
    console.log('   - clearAllLikes()    : លុបទិន្នន័យទាំងអស់');
    console.log('   - exportLikesData()  : នាំចេញទិន្នន័យ');
    console.log('   - importLikesData()  : នាំចូលទិន្នន័យ');
});

// ========== IMAGE GALLERY OVERLAY ==========
function initImageGallery() {
    let overlay = document.getElementById('overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.cssText = `
            position: fixed;
            display: none;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            justify-content: center;
            align-items: center;
            z-index: 9999;
            cursor: pointer;
        `;
        document.body.appendChild(overlay);
        
        const fullImg = document.createElement('img');
        fullImg.style.cssText = `
            max-width: 90%;
            max-height: 85%;
            border: 4px solid white;
            border-radius: 8px;
            box-shadow: 0 0 30px rgba(0,0,0,0.5);
        `;
        overlay.appendChild(fullImg);
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 40px;
            color: white;
            font-size: 50px;
            cursor: pointer;
            transition: transform 0.3s ease;
        `;
        closeBtn.onmouseover = () => closeBtn.style.transform = 'rotate(90deg)';
        closeBtn.onmouseout = () => closeBtn.style.transform = 'rotate(0)';
        overlay.appendChild(closeBtn);
        
        overlay.onclick = function(e) {
            if (e.target === overlay || e.target === closeBtn) {
                overlay.style.display = 'none';
            }
        };
    }
    
    const galleryImages = document.querySelectorAll('.image-gallery img, .card-image img');
    galleryImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            const overlay = document.getElementById('overlay');
            const fullImg = overlay.querySelector('img');
            fullImg.src = this.src;
            fullImg.alt = this.alt || 'រូបភាពពង្រីក';
            overlay.style.display = 'flex';
        });
    });
}

// ដំណើរការ Image Gallery
initImageGallery();

// កំណត់ឲ្យ function អាចប្រើពីខាងក្រៅបាន
window.likeArticle = likeArticle;