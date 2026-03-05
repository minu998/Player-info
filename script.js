// API Configuration
const INFO_API_URL = "https://sb-x-hacker-all-info.vercel.app/player-info";
const BANNER_API_URL = "https://banner-api-rho.vercel.app/profile";

// Developer Info
const DEVELOPER = "@RIYAD_CODER";

// Icons for different sections
const ICONS = {
    id: '🆔', crown: '👑', globe: '🌍', level: '📊', exp: '💎',
    rank: '🎯', cs: '🎖️', clan: '🏰', pet: '🐾', social: '💬',
    like: '❤️', badge: '🛡️', time: '⏰', calendar: '📅', money: '💰',
    weapon: '🔫', skin: '🎨', signature: '📝', diamond: '💎'
};

// Set example UID
function setExample(uid) {
    document.getElementById('uidInput').value = uid;
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    try {
        const date = new Date(parseInt(timestamp) * 1000);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'N/A';
    }
}

// Format number with commas
function formatNumber(num) {
    if (num === undefined || num === null) return 'N/A';
    try {
        return parseInt(num).toLocaleString();
    } catch {
        return num.toString();
    }
}

// Get rank tier
function getRankTier(points) {
    points = parseInt(points) || 0;
    if (points >= 4200) return 'Grandmaster';
    if (points >= 3600) return 'Heroic';
    if (points >= 3000) return 'Diamond';
    if (points >= 2400) return 'Platinum';
    if (points >= 1800) return 'Gold';
    if (points >= 1200) return 'Silver';
    return 'Bronze';
}

// Main function to fetch player info
async function fetchPlayerInfo() {
    const uid = document.getElementById('uidInput').value.trim();
    
    // Validate UID
    if (!uid) {
        showError('Please enter a UID');
        return;
    }
    
    if (!/^\d+$/.test(uid)) {
        showError('UID must contain only numbers');
        return;
    }
    
    // Show loading, hide previous results
    showLoading();
    hidePlayerInfo();
    hideBanner();
    hideError();
    
    try {
        // Fetch player info
        const infoResponse = await fetch(`${INFO_API_URL}?uid=${uid}`);
        
        if (!infoResponse.ok) {
            throw new Error(`HTTP error! status: ${infoResponse.status}`);
        }
        
        const data = await infoResponse.json();
        
        if (!data || !data.basicInfo) {
            throw new Error('Player not found or invalid UID');
        }
        
        // Display player info
        displayPlayerInfo(data, uid);
        
        // Fetch and display banner
        fetchBanner(uid, data.basicInfo.nickname);
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to fetch player information');
        hideLoading();
    }
}

// Display player information
function displayPlayerInfo(data, uid) {
    const basic = data.basicInfo || {};
    const profile = data.profileInfo || {};
    const clan = data.clanBasicInfo || {};
    const captain = data.captainBasicInfo || {};
    const pet = data.petInfo || {};
    const social = data.socialInfo || {};
    const credit = data.creditScoreInfo || {};
    
    const brTier = getRankTier(basic.rankingPoints);
    const csTier = getRankTier(basic.csRankingPoints);
    
    const infoHtml = `
        <div class="info-header">
            <i class="fas fa-user-circle"></i>
            <div class="header-text">
                <h2>${basic.nickname || 'Unknown Player'}</h2>
                <p><i class="fas fa-id"></i> UID: ${uid}</p>
            </div>
        </div>
        
        <div class="info-content">
            <div class="info-grid">
                <!-- Basic Info -->
                <div class="info-section">
                    <div class="section-title">
                        <i class="fas fa-info-circle"></i>
                        <h3>BASIC INFORMATION</h3>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-id"></i> Account ID:</span>
                        <span class="info-value">${basic.accountId || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-globe"></i> Region:</span>
                        <span class="info-value">${basic.region || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-level-up"></i> Level:</span>
                        <span class="info-value highlight">${basic.level || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-star"></i> EXP:</span>
                        <span class="info-value">${formatNumber(basic.exp)}</span>
                    </div>
                </div>
                
                <!-- Ranking Info -->
                <div class="info-section">
                    <div class="section-title">
                        <i class="fas fa-trophy"></i>
                        <h3>RANKING INFORMATION</h3>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-ranking-star"></i> BR Rank:</span>
                        <span class="info-value">${basic.rank || 'N/A'} (${brTier})</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-star"></i> BR Points:</span>
                        <span class="info-value">${formatNumber(basic.rankingPoints)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-crosshairs"></i> CS Rank:</span>
                        <span class="info-value">${basic.csRank || 'N/A'} (${csTier})</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-star"></i> CS Points:</span>
                        <span class="info-value">${formatNumber(basic.csRankingPoints)}</span>
                    </div>
                </div>
                
                <!-- Clan Info -->
                <div class="info-section">
                    <div class="section-title">
                        <i class="fas fa-shield-alt"></i>
                        <h3>CLAN INFORMATION</h3>
                    </div>
                    ${clan.clanName ? `
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-crown"></i> Clan Name:</span>
                        <span class="info-value highlight">${clan.clanName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-id"></i> Clan ID:</span>
                        <span class="info-value">${clan.clanId || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-level-up"></i> Clan Level:</span>
                        <span class="info-value">${clan.clanLevel || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-users"></i> Members:</span>
                        <span class="info-value">${clan.memberNum || '0'}/${clan.capacity || '0'}</span>
                    </div>
                    ` : '<p style="color: var(--gray);">No clan information available</p>'}
                </div>
                
                <!-- Pet Info -->
                <div class="info-section">
                    <div class="section-title">
                        <i class="fas fa-paw"></i>
                        <h3>PET INFORMATION</h3>
                    </div>
                    ${pet.name ? `
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-crown"></i> Pet Name:</span>
                        <span class="info-value">${pet.name}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-id"></i> Pet ID:</span>
                        <span class="info-value">${pet.id || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-level-up"></i> Level:</span>
                        <span class="info-value">${pet.level || 'N/A'}</span>
                    </div>
                    ` : '<p style="color: var(--gray);">No pet information available</p>'}
                </div>
                
                <!-- Social Info -->
                <div class="info-section">
                    <div class="section-title">
                        <i class="fas fa-users"></i>
                        <h3>SOCIAL INFORMATION</h3>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-heart"></i> Likes:</span>
                        <span class="info-value">${formatNumber(basic.liked)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-certificate"></i> Badges:</span>
                        <span class="info-value">${basic.badgeCnt || '0'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-signature"></i> Signature:</span>
                        <span class="info-value">${social.signature || 'No signature'}</span>
                    </div>
                </div>
                
                <!-- Activity -->
                <div class="info-section">
                    <div class="section-title">
                        <i class="fas fa-clock"></i>
                        <h3>ACTIVITY</h3>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-sign-in-alt"></i> Last Login:</span>
                        <span class="info-value">${formatTimestamp(basic.lastLoginAt)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-calendar-plus"></i> Created:</span>
                        <span class="info-value">${formatTimestamp(basic.createAt)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-credit-score"></i> Credit Score:</span>
                        <span class="info-value">${credit.creditScore || 'N/A'}/100</span>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--card-border); text-align: center; color: var(--gray);">
                <p><i class="fas fa-crown" style="color: var(--primary);"></i> Developer: ${DEVELOPER}</p>
            </div>
        </div>
    `;
    
    document.getElementById('playerInfo').innerHTML = infoHtml;
    document.getElementById('playerInfo').style.display = 'block';
    hideLoading();
}

// Fetch and display banner
async function fetchBanner(uid, nickname) {
    try {
        const response = await fetch(`${BANNER_API_URL}?uid=${uid}`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            const bannerHtml = `
                <div class="banner-title">
                    <i class="fas fa-image"></i>
                    <h3>PLAYER BANNER</h3>
                </div>
                <div class="banner-image">
                    <img src="${url}" alt="Player Banner">
                </div>
                <div class="banner-caption">
                    <p><i class="fas fa-user"></i> ${nickname || 'Player'} | UID: ${uid}</p>
                </div>
            `;
            
            document.getElementById('bannerContainer').innerHTML = bannerHtml;
            document.getElementById('bannerContainer').style.display = 'block';
        }
    } catch (error) {
        console.error('Banner fetch error:', error);
    }
}

// Show loading spinner
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

// Hide loading spinner
function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Hide player info
function hidePlayerInfo() {
    document.getElementById('playerInfo').style.display = 'none';
}

// Hide banner
function hideBanner() {
    document.getElementById('bannerContainer').style.display = 'none';
}

// Show error message
function showError(message) {
    const errorHtml = `
        <i class="fas fa-exclamation-circle"></i>
        <h3>Error</h3>
        <p>${message}</p>
    `;
    document.getElementById('errorMessage').innerHTML = errorHtml;
    document.getElementById('errorMessage').style.display = 'block';
    hideLoading();
}

// Hide error message
function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

// Allow Enter key to submit
document.getElementById('uidInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        fetchPlayerInfo();
    }
});