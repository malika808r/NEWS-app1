// Вставь сюда ключ от NewsData.io
const API_KEY = "pub_82bbc1932d104e3f8aee31d938488527"; 
const url = "https://newsdata.io/api/1/news?";

window.addEventListener("load", () => fetchNews("technology"));

function reloadPage() {
    window.location.reload();
}

async function fetchNews(query) {
    const cardsContainer = document.getElementById("cards-container");
    const errorMessage = document.getElementById("error-message");

    cardsContainer.innerHTML = "<p style='text-align:center;width:100%'>Loading...</p>";
    errorMessage.style.display = "none";

    try {
        // NewsData использует параметр 'q' для поиска и 'language' для языка
        // ВНИМАНИЕ: Бесплатный тариф может требовать указывать конкретную страну или язык
        const res = await fetch(`${url}apikey=${API_KEY}&q=${query}&language=en`);
        
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        
        const data = await res.json();

        // У NewsData массив новостей называется 'results'
        if (data.results && data.results.length > 0) {
            bindData(data.results);
        } else {
            cardsContainer.innerHTML = "";
            errorMessage.textContent = "News not found";
            errorMessage.style.display = "block";
        }

    } catch (err) {
        cardsContainer.innerHTML = "";
        console.error(err);
        errorMessage.textContent = "Error: " + err.message;
        errorMessage.style.display = "block";
    }
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    articles.forEach(article => {
        // Иногда приходят новости без картинок или id, фильтруем их
        if(!article.title) return; 

        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const img = cardClone.querySelector(".news-img");
    
    // NewsData: поле картинки называется 'image_url'
    // Ставим заглушку, если картинки нет
    img.src = article.image_url || "https://placehold.co/400x200?text=No+Image";
    
    // Обработка ошибки загрузки картинки
    img.onerror = function() {
        this.src = "https://placehold.co/400x200?text=No+Image";
    };

    cardClone.querySelector(".news-title").textContent = article.title;
    
    // У NewsData описание может быть длинным или отсутствовать
    const desc = article.description || article.content || "Click to read details...";
    // Обрезаем описание вручную, если CSS не справится
    cardClone.querySelector(".news-desc").textContent = desc.slice(0, 150) + "...";

    // Дата
    const date = new Date(article.pubDate).toLocaleDateString("en-US", {
        year: 'numeric', month: 'short', day: 'numeric'
    });
    
    // Источник (source_id)
    cardClone.querySelector(".news-source").textContent = `${article.source_id} • ${date}`;

    cardClone.querySelector(".card").onclick = () => {
        window.open(article.link, "_blank"); // У NewsData ссылка - это 'link'
    };
}

let curSelectedNav = null;
function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.getElementById(id);
    if (curSelectedNav) curSelectedNav.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}

document.getElementById("search-button").addEventListener("click", () => {
    const query = document.getElementById("search-text").value;
    if (!query) return;
    fetchNews(query);
});