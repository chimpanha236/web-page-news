// ========== ១. ការគ្រប់គ្រងទិន្នន័យ (ID Generator) ==========
function generateArticleId(article) {
    const titleElement = article.querySelector('h3, .card-title');
    let title = titleElement ? titleElement.innerText.trim() : 'article';
    return 'news_' + title.substring(0, 30).replace(/[^a-zA-Z0-9\u1780-\u17FF]/g, '_').toLowerCase();
}

// ========== ២. មុខងារ LIKE & UNLIKE ==========
function toggleLike(btn) {
    const article = btn.closest('.news-card');
    const articleId = generateArticleId(article);
    const countSpan = btn.querySelector('.count');
    let count = parseInt(countSpan.innerText) || 0;

    if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        count = Math.max(0, count - 1);
        showNotification('ឈប់ចូលចិត្តអត្ថបទនេះ');
        saveInteraction(articleId, count, false);
    } else {
        btn.classList.add('active');
        count++;
        showNotification('អ្នកបានចូលចិត្តអត្ថបទនេះ ❤️');
        saveInteraction(articleId, count, true);
    }
    countSpan.innerText = count;
}

function saveInteraction(articleId, count, isLiked) {
    const data = { likes: count, liked: isLiked, lastUpdated: new Date().toISOString() };
    localStorage.setItem(`like_${articleId}`, JSON.stringify(data));
    updateArticleList(articleId);
}

// ========== ៣. មុខងារ COMMENT ==========
function toggleComment(btn) {
    const cardContent = btn.closest('.card-content');
    const commentSection = cardContent.querySelector('.comment-section');
    commentSection.classList.toggle('hidden');
}

function postComment(btn) {
    const cardContent = btn.closest('.card-content');
    const input = cardContent.querySelector('.comment-input');
    const list = cardContent.querySelector('.comments-list');
    const articleId = generateArticleId(btn.closest('.news-card'));

    if (input.value.trim() === '') return;

    const commentData = { text: input.value.trim(), time: new Date().toLocaleString('km-KH') };
    addCommentToUI(list, commentData);

    let comments = JSON.parse(localStorage.getItem(`comments_${articleId}`) || '[]');
    comments.push(commentData);
    localStorage.setItem(`comments_${articleId}`, JSON.stringify(comments));

    input.value = '';
    showNotification('បានបញ្ជូនមតិរួចរាល់!');
}

function addCommentToUI(listElement, data) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.innerHTML = `<strong>អ្នកអាន៖</strong> ${data.text} <br> <small style="color:#999; font-size:10px;">${data.time}</small>`;
    listElement.prepend(div);
}

// ========== ៤. មុខងារ SHARE & NOTIFICATION ==========
function shareArticle(btn) {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        showNotification('បានចម្លង Link រួចរាល់! 🔗');
    });
}

function showNotification(message) {
    const note = document.createElement('div');
    note.className = 'notification';
    note.style.cssText = `position: fixed; bottom: 20px; right: 20px; background: #003366; color: white; padding: 12px 25px; border-radius: 50px; z-index: 10000; font-family: 'siemreap', sans-serif; animation: slideIn 0.3s ease;`;
    note.innerText = message;
    document.body.appendChild(note);
    setTimeout(() => { note.remove(); }, 3000);
}

// ========== ៥. មុខងារ IMAGE GALLERY (កែសម្រួលរួចរាល់) ==========
let currentGallery = [];
let currentIndex = 0;
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("fullImage");
const modalBg = document.getElementById("modalBlurBg");

function initGallery() {
    document.querySelectorAll('.news-card').forEach(card => {
        const imagesInCard = Array.from(card.querySelectorAll('.card-image img, .image-gallery img'));
        imagesInCard.forEach((img, index) => {
            img.onclick = (e) => {
                e.stopPropagation();
                currentGallery = imagesInCard.map(i => i.src);
                currentIndex = index;
                updateModal();
            };
        });
    });
}

function updateModal() {
    if (!modal || !modalImg) return;
    modal.style.display = "flex";
    const src = currentGallery[currentIndex];
    modalImg.src = src;
    if (modalBg) modalBg.style.backgroundImage = `url('${src}')`;
}

function changeImage(step) {
    currentIndex += step;
    if (currentIndex >= currentGallery.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = currentGallery.length - 1;
    updateModal();
}

function closeImage() {
    if (modal) modal.style.display = "none";
}

function updateModal() {
    if (!modal || !modalImg) return;
    
    modal.style.display = "flex";
    const src = currentGallery[currentIndex];
    
    // បង្ហាញរូបភាពចម្បង
    modalImg.src = src;
    
    // បង្ហាញរូបភាពព្រាលនៅខាងក្រោយ
    if (modalBg) {
        modalBg.style.backgroundImage = `url('${src}')`;
    }
}

function updateModal() {
    modal.style.display = "flex";
    const src = currentGallery[currentIndex];
    modalImg.src = src;

    // បង្កើតរូបភាពតូចៗនៅខាងក្រោម
    const thumbBar = document.getElementById("thumbBar");
    thumbBar.innerHTML = ""; // សម្អាតចាស់ចេញ

    currentGallery.forEach((imgSrc, index) => {
        const thumb = document.createElement("img");
        thumb.src = imgSrc;
        thumb.className = "thumb-img" + (index === currentIndex ? " active" : "");
        
        thumb.onclick = (e) => {
            e.stopPropagation();
            currentIndex = index;
            updateModal();
        };
        thumbBar.appendChild(thumb);
    });
}

// បន្ថែម Swipe សម្រាប់ទូរស័ព្ទ
let startX = 0;
if (modal) {
    modal.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    modal.addEventListener('touchend', e => {
        let diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) changeImage(diff > 0 ? 1 : -1);
    });
    // ចុចលើផ្ទៃខាងក្រោយដើម្បីបិទ
    modal.onclick = (e) => { if (e.target === modal || e.target.id === 'modalBlurBg') closeImage(); };
}

// ========== ៦. ផ្ទុកទិន្នន័យពេលបើក Page ==========
function loadAllData() {
    document.querySelectorAll('.news-card').forEach(card => {
        const articleId = generateArticleId(card);
        const savedLike = JSON.parse(localStorage.getItem(`like_${articleId}`));
        if (savedLike) {
            const likeBtn = card.querySelector('.like-btn');
            if (likeBtn) {
                likeBtn.querySelector('.count').innerText = savedLike.likes;
                if (savedLike.liked) likeBtn.classList.add('active');
            }
        }
        const savedComments = JSON.parse(localStorage.getItem(`comments_${articleId}`) || '[]');
        const list = card.querySelector('.comments-list');
        if (list) savedComments.forEach(c => addCommentToUI(list, c));
    });
}

function updateArticleList(id) {
    let list = JSON.parse(localStorage.getItem('all_articles') || '[]');
    if (!list.includes(id)) { list.push(id); localStorage.setItem('all_articles', JSON.stringify(list)); }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    initGallery();
});