/**
 * 覚醒回数やレアリティが変更されたときにレベルを1にリセットする関数
 */
function resetLevel() {
    const levelInput = document.getElementById('level');
    
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
    const maxAwakening = parseInt(selectedRarityOption.getAttribute('data-awakening-limit'), 10); 
    
    // 覚醒回数とレベルを数値に変換
    let awakeningCount = parseInt(awakeningInput, 10) || 0;
    let level = parseInt(levelInput, 10) || 1; 

    // アクセサリの種類と宝石の補正値を取得
    const accessorySelect = document.getElementById('accessory_type');
    const gemSelect = document.getElementById('gem_level');
    
    const selectedAccessoryOption = accessorySelect.options[accessorySelect.selectedIndex];
    
    // 補正されるステータスの種類を取得 (hp, atk, spd, hp_spd, hp_atk, atk_spd)
    const boostType = selectedAccessoryOption.getAttribute('data-boost');
    // 宝石による補正値を取得 (10, 20, 30, 40, 50など)
    const gemValue = parseInt(gemSelect.value, 10) || 0;


    // 初期ステータスの取得（手入力値）
    let baseHp = parseInt(document.getElementById('base_hp').value, 10) || 0;
    let baseAtk = parseInt(document.getElementById('base_atk').value, 10) || 0;
    let baseSpd = parseInt(document.getElementById('base_spd').value, 10) || 0;
    
    // ----------------------------------------------------------------
    // 2. アクセサリによる初期ステータスへの補正を加算 (ロジックを全面修正)
    // ----------------------------------------------------------------
    let accessoryHp = 0;
    let accessoryAtk = 0;
    let accessorySpd = 0;
    
    if (boostType.includes('hp')) {
        baseHp += gemValue;
        accessoryHp = gemValue;
    }
    if (boostType.includes('atk')) {
        baseAtk += gemValue;
        accessoryAtk = gemValue;
    }
    if (boostType.includes('spd')) {
        baseSpd += gemValue;
        accessorySpd = gemValue;
    }

    // ----------------------------------------------------------------
    // 3. 覚醒回数の検証と補正 (上限: レア度+17回)
    // ----------------------------------------------------------------
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

    // ----------------------------------------------------------------
    // 4. 最終レベル上限の計算とレベルの検証
    // ----------------------------------------------------------------
    // 覚醒1回あたり、レベル上限が 5 上昇
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
    // 5. 結果の表示
    // ----------------------------------------------------------------
    document.getElementById('level-info').textContent = levelMessage;
    
    if (!isSilent) {
        if (isLevelCorrected) {
             document.getElementById('result-message').textContent = '入力レベルを自動的に補正しました。';
        } else {
             document.getElementById('result-message').textContent = '入力値の検証を完了しました。ここにステータス推測の計算結果を表示します。';
        }
    }

    // ----------------------------------------------------------------
    // 6. ステータス推測計算の実行 (ここに実際の推測ロジックを実装)
    // ----------------------------------------------------------------
    
    // TODO: 実際のステータス推測ロジックを実装してください。
    if (!isSilent) {
        const accessoryName = selectedAccessoryOption.textContent.split('(')[0].trim();
        const gemName = gemSelect.options[gemSelect.selectedIndex].textContent.split('(')[0].trim();
        
        console.log(`[使用アクセサリ]: ${accessoryName} + ${gemName}`);
        console.log(`[補正後の初期ステータス]: HP=${baseHp}, ATK=${baseAtk}, SPD=${baseSpd}`);
        console.log(`(アクセサリ補正: HP+${accessoryHp}, ATK+${accessoryAtk}, SPD+${accessorySpd})`);
    }
}

// ページロード時にも一度レベル情報を表示 (初期値の確認用)
document.addEventListener('DOMContentLoaded', () => {
    calculateStatus(true); 
});