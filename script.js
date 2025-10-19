/**
 * 覚醒回数やレアリティが変更されたときにレベルを1にリセットする関数
 */
function resetLevel() {
    const levelInput = document.getElementById('level');
    
    // 覚醒するとレベルが1に戻るルールを適用
    if (levelInput) {
        levelInput.value = 1;
        calculateStatus(true); 
    }
}


/**
 * メインのステータス推測と入力値の検証を実行する関数
 */
function calculateStatus(isSilent = false) {
    // ----------------------------------------------------------------
    // 1. 入力値の取得
    // ----------------------------------------------------------------
    const levelInput = document.getElementById('level').value;
    const awakeningInput = document.getElementById('awakening').value; 
    const raritySelect = document.getElementById('rarity');
    
    const selectedRarityOption = raritySelect.options[raritySelect.selectedIndex];

    // レアリティごとの基本レベル上限と覚醒上限回数を取得
    const baseMaxLevel = parseInt(raritySelect.value, 10);
    const maxAwakening = parseInt(selectedRarityOption.getAttribute('data-max-awakening'), 10); 
    
    // 覚醒回数とレベルを数値に変換
    let awakeningCount = parseInt(awakeningInput, 10) || 0;
    let level = parseInt(levelInput, 10) || 1; 

    // アクセサリの種類と宝石の補正値を取得
    const accessorySelect = document.getElementById('accessory_type');
    const gemSelect = document.getElementById('gem_level');
    
    const selectedAccessoryOption = accessorySelect.options[accessorySelect.selectedIndex];
    
    const boostType = selectedAccessoryOption.getAttribute('data-boost');
    const gemValue = parseInt(gemSelect.value, 10) || 0;


    // 初期ステータスの取得（手入力値 - 覚醒0回時のLv.1ステータスとして扱う）
    let baseHp = parseInt(document.getElementById('base_hp').value, 10) || 0;
    let baseAtk = parseInt(document.getElementById('base_atk').value, 10) || 0;
    let baseSpd = parseInt(document.getElementById('base_spd').value, 10) || 0;
    
    // ----------------------------------------------------------------
    // 2. アクセサリによる純粋なLv.1補正値の計算
    // ----------------------------------------------------------------
    let accessoryHp = 0;
    let accessoryAtk = 0;
    let accessorySpd = 0;
    
    if (boostType.includes('hp')) {
        accessoryHp = gemValue;
    }
    if (boostType.includes('atk')) {
        accessoryAtk = gemValue;
    }
    if (boostType.includes('spd')) {
        accessorySpd = gemValue;
    }

    // ----------------------------------------------------------------
    // 3. 覚醒 Lv.1 ステータスへの累積ボーナス計算
    // ----------------------------------------------------------------
    
    let totalBonusHp = 0;
    let totalBonusAtk = 0;
    let totalBonusSpd = 0;
    
    // 累積ボーナス計算: 覚醒1回あたり (元のLv.1ステータス * 0.01) + 10 が累積
    for (let i = 0; i < awakeningCount; i++) {
        // 累積ボーナス計算: (元のLv.1ステータス * 0.01) + 10
        totalBonusHp += Math.floor(baseHp * 0.01) + 10;
        totalBonusAtk += Math.floor(baseAtk * 0.01) + 10;
        totalBonusSpd += Math.floor(baseSpd * 0.01) + 10;
    }
    
    // 最終的なLv.1ステータス (現在の覚醒回数適用後)
    // = 手入力値 + 累積ボーナス + 現在のアクセサリ補正値
    const currentLv1Hp = baseHp + totalBonusHp + accessoryHp;
    const currentLv1Atk = baseAtk + totalBonusAtk + accessoryAtk;
    const currentLv1Spd = baseSpd + totalBonusSpd + accessorySpd;
    
    // ----------------------------------------------------------------
    // 4. 覚醒回数、レベルの検証・補正
    // ----------------------------------------------------------------
    // 覚醒回数の検証
    if (awakeningCount > maxAwakening) {
        awakeningCount = maxAwakening; 
        document.getElementById('awakening').value = maxAwakening; 
        if (!isSilent) {
             document.getElementById('result-message').textContent = `注意: 覚醒回数が上限（${maxAwakening}回）を超えたため、${maxAwakening}回に補正しました。`;
        }
    }
    if (awakeningCount < 0) {
        awakeningCount = 0;
        document.getElementById('awakening').value = 0;
    }

    // 最終レベル上限の計算ロジック: 
    // 最終上限 = 初期Lv.上限 + (覚醒回数 * 5)
    // このロジックは、以前の修正で既に「覚醒ごとにLv上限が5増える」仕様を反映済みです。
    const bonusMaxLevel = awakeningCount * 5; 
    const finalMaxLevel = baseMaxLevel + bonusMaxLevel; 

    let levelMessage = `現在のレベル上限: ${finalMaxLevel}`;
    let isLevelCorrected = false;

    // レベルの検証
    if (level < 1) {
        level = 1;
        document.getElementById('level').value = 1;
        isLevelCorrected = true;
    }
    if (level > finalMaxLevel) {
        level = finalMaxLevel; 
        document.getElementById('level').value = finalMaxLevel;
        isLevelCorrected = true;
        levelMessage += ` (⚠️ レベルが上限を超えていたため、${finalMaxLevel}に補正)`;
    }
    
    // ----------------------------------------------------------------
    // 5. ステータス推測計算の実行 (Lv.1からの線形成長推測)
    // ----------------------------------------------------------------
    
    // 暫定的な推測ロジック：成長値 = Current Lv.1ステータス / 10
    const growthHp = currentLv1Hp / 10;
    const growthAtk = currentLv1Atk / 10;
    const growthSpd = currentLv1Spd / 10;
    
    const levelDifference = level - 1;
    
    const finalHp = Math.round(currentLv1Hp + (growthHp * levelDifference));
    const finalAtk = Math.round(currentLv1Atk + (growthAtk * levelDifference));
    const finalSpd = Math.round(currentLv1Spd + (growthSpd * levelDifference));
    
    // ----------------------------------------------------------------
    // 6. 結果の表示
    // ----------------------------------------------------------------
    document.getElementById('level-info').textContent = levelMessage;
    
    if (!isSilent) {
        if (isLevelCorrected) {
             document.getElementById('result-message').textContent = '入力レベルを自動的に補正しました。';
        } else {
             document.getElementById('result-message').textContent = '覚醒ボーナスとアクセサリ補正を適用し、ステータスを推測しました。';
        }
    }
    
    // 結果をUIに反映
    document.getElementById('final-hp').textContent = `体力 (HP): ${finalHp} (Lv.1時: ${currentLv1Hp})`;
    document.getElementById('final-atk').textContent = `攻撃 (ATK): ${finalAtk} (Lv.1時: ${currentLv1Atk})`;
    document.getElementById('final-spd').textContent = `速さ (SPD): ${finalSpd} (Lv.1時: ${currentLv1Spd})`;
    
    // 見出しのレベルを更新
    document.querySelector('.result-section h3').textContent = `最終ステータス (Lv. ${level} 時点)`;
    
    // ----------------------------------------------------------------
    // 7. コンソール出力 (デバッグ用)
    // ----------------------------------------------------------------
    if (!isSilent) {
        const accessoryName = selectedAccessoryOption.textContent.split('(')[0].trim();
        const gemName = gemSelect.options[gemSelect.selectedIndex].textContent.split('(')[0].trim();
        
        console.log(`--- DEBUG INFO ---`);
        console.log(`[使用アクセサリ]: ${accessoryName} + ${gemName}`);
        console.log(`[覚醒回数]: ${awakeningCount}回 / [現在のレベル]: ${level}`);
        console.log(`[手入力の初期Lv.1]: HP=${baseHp}, ATK=${baseAtk}, SPD=${baseSpd}`);
        console.log(`[累積覚醒ボーナス]: HP+${totalBonusHp}, ATK+${totalBonusAtk}, SPD+${totalBonusSpd}`);
        console.log(`[アクセサリ補正]: HP+${accessoryHp}, ATK+${accessoryAtk}, SPD+${accessorySpd}`);
        console.log(`[現在のLv.1ステータス (補正済)]: HP=${currentLv1Hp}, ATK=${currentLv1Atk}, SPD=${currentLv1Spd}`);
        console.log(`[推測結果 (最終)]: HP=${finalHp}, ATK=${finalAtk}, SPD=${finalSpd}`);
    }
}

// ページロード時にも一度レベル情報を表示 (初期値の確認用)
document.addEventListener('DOMContentLoaded', () => {
    calculateStatus(true); 
});