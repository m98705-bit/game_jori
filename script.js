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
 * デバッグ情報の表示/非表示を切り替える関数
 */
function toggleDebugInfo() {
    const debugOutput = document.getElementById('debug-output');
    const toggleButton = document.querySelector('.debug-info-toggle small');
    
    if (debugOutput.style.display === 'none') {
        debugOutput.style.display = 'block';
        toggleButton.textContent = '詳細情報/デバッグ情報を非表示 🔼';
    } else {
        debugOutput.style.display = 'none';
        toggleButton.textContent = '詳細情報/デバッグ情報を表示 🔽';
    }
}


/**
 * メインのステータス推測と入力値の検証を実行する関数
 */
function calculateStatus(isSilent = false) {
    // ----------------------------------------------------------------
    // 1. 入力値の取得と準備
    // ----------------------------------------------------------------
    const levelInput = document.getElementById('level');
    const awakeningInput = document.getElementById('awakening'); 
    const raritySelect = document.getElementById('rarity');
    const growthSelect = document.getElementById('growth_type'); 
    
    const baseHpInput = document.getElementById('base_hp');
    const baseAtkInput = document.getElementById('base_atk');
    const baseSpdInput = document.getElementById('base_spd');
    
    const selectedRarityOption = raritySelect.options[raritySelect.selectedIndex];
    const selectedGrowthOption = growthSelect.options[growthSelect.selectedIndex]; 

    // レアリティと成長型の設定値を取得
    const baseMaxLevel = parseInt(raritySelect.value, 10);
    const maxAwakening = parseInt(selectedRarityOption.getAttribute('data-max-awakening'), 10); 
    const growthHpPerLevel = parseInt(selectedGrowthOption.getAttribute('data-hp'), 10);
    const growthAtkPerLevel = parseInt(selectedGrowthOption.getAttribute('data-atk'), 10);
    const growthSpdPerLevel = parseInt(selectedGrowthOption.getAttribute('data-spd'), 10);
    
    // 現在の入力値を取得
    let awakeningCount = parseInt(awakeningInput.value, 10) || 0;
    let level = parseInt(levelInput.value, 10) || 1; // 現Lvは検証用として残す
    let baseHp = parseInt(baseHpInput.value, 10) || 1; 
    let baseAtk = parseInt(baseAtkInput.value, 10) || 1; 
    let baseSpd = parseInt(baseSpdInput.value, 10) || 1; 

    // アクセサリの設定値を取得
    const accessorySelect = document.getElementById('accessory_type');
    const selectedAccessoryOption = accessorySelect.options[accessorySelect.selectedIndex];
    const boostType = selectedAccessoryOption.getAttribute('data-boost');
    const gemValue = parseInt(selectedAccessoryOption.getAttribute('data-gem-value'), 10) || 0; 


    // ----------------------------------------------------------------
    // 2. マイナス入力検証と補正 (エラー処理の強化)
    // ----------------------------------------------------------------
    let correctionMessage = '';
    let corrected = false;
    
    // 覚醒回数: 最小値は0
    if (awakeningCount < 0) {
        awakeningCount = 0;
        awakeningInput.value = 0;
        correctionMessage += '覚醒回数にマイナス値が入力されたため、0に補正しました。';
        corrected = true;
    }
    
    // 現在のレベル: 最小値は1
    if (level < 1) {
        level = 1;
        levelInput.value = 1;
        correctionMessage += (correctionMessage ? ' ' : '') + 'レベルにマイナス値が入力されたため、1に補正しました。';
        corrected = true;
    }
    
    // 初期ステータス (HP, ATK, SPD): 最小値は1
    if (baseHp < 1) {
        baseHp = 1;
        baseHpInput.value = 1;
        correctionMessage += (correctionMessage ? ' ' : '') + '初期HPに不正な値が入力されたため、1に補正しました。';
        corrected = true;
    }
    if (baseAtk < 1) {
        baseAtk = 1;
        baseAtkInput.value = 1;
        correctionMessage += (correctionMessage ? ' ' : '') + '初期ATKに不正な値が入力されたため、1に補正しました。';
        corrected = true;
    }
    if (baseSpd < 1) {
        baseSpd = 1;
        baseSpdInput.value = 1;
        correctionMessage += (correctionMessage ? ' ' : '') + '初期SPDに不正な値が入力されたため、1に補正しました。';
        corrected = true;
    }
    
    if (corrected && !isSilent) {
        document.getElementById('result-message').textContent = `⚠️ ${correctionMessage}`;
        isSilent = true; 
    }

    // ----------------------------------------------------------------
    // 3. アクセサリによる純粋なLv.1補正値の計算
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
    // 4. 覚醒 Lv.1 ステータスへの累積ボーナス計算
    // ----------------------------------------------------------------
    
    let totalBonusHp = 0;
    let totalBonusAtk = 0;
    let totalBonusSpd = 0;
    
    // 累積ボーナス計算: 覚醒1回あたり (元のLv.1ステータス * 0.01) + 10 が累積
    for (let i = 0; i < awakeningCount; i++) {
        totalBonusHp += Math.floor(baseHp * 0.01) + 10;
        totalBonusAtk += Math.floor(baseAtk * 0.01) + 10;
        totalBonusSpd += Math.floor(baseSpd * 0.01) + 10;
    }
    
    // 最終的なLv.1ステータス (現在の覚醒回数適用後)
    const currentLv1Hp = baseHp + totalBonusHp + accessoryHp;
    const currentLv1Atk = baseAtk + totalBonusAtk + accessoryAtk;
    const currentLv1Spd = baseSpd + totalBonusSpd + accessorySpd;
    
    // ----------------------------------------------------------------
    // 5. 覚醒回数、レベルの検証・補正 (最大値チェック)とステータス計算
    // ----------------------------------------------------------------
    
    // 覚醒回数の検証 (最大値チェック)
    if (awakeningCount > maxAwakening) {
        awakeningCount = maxAwakening; 
        awakeningInput.value = maxAwakening; 
        if (!isSilent) {
             document.getElementById('result-message').textContent = `注意: 覚醒回数が上限（${maxAwakening}回）を超えたため、${maxAwakening}回に補正しました。`;
             isSilent = true;
        }
    }

    // 最終レベル上限の計算ロジック: 最終上限 = 初期Lv.上限 + (覚醒回数 * 5)
    const bonusMaxLevel = awakeningCount * 5; 
    const finalMaxLevel = baseMaxLevel + bonusMaxLevel; 

    // 現Lvの最大値チェック (表示上はMaxLvを超える入力もMaxLvに補正)
    let isLevelCorrected = false;
    if (level > finalMaxLevel) {
        level = finalMaxLevel; 
        levelInput.value = finalMaxLevel;
        isLevelCorrected = true;
    }
    
    // 計算に使用するレベルを最大レベルに固定
    const levelUsedForCalculation = finalMaxLevel;
    const levelDifference = levelUsedForCalculation - 1; // Lv.1からのレベル上昇回数
    
    // 成長型による加算計算
    const totalGrowthHp = growthHpPerLevel * levelDifference;
    const totalGrowthAtk = growthAtkPerLevel * levelDifference;
    const totalGrowthSpd = growthSpdPerLevel * levelDifference;

    const finalHp = currentLv1Hp + totalGrowthHp;
    const finalAtk = currentLv1Atk + totalGrowthAtk;
    const finalSpd = currentLv1Spd + totalGrowthSpd;
    
    // ----------------------------------------------------------------
    // 6. 結果の表示 (UI更新)
    // ----------------------------------------------------------------
    
    // ★★★ 修正箇所: 最終ステータスの見出しを更新 ★★★
    document.getElementById('final-level-display').textContent = `Lv. ${finalMaxLevel}`;
    document.getElementById('final-awakening-display').textContent = `覚醒${awakeningCount}回`;

    // レベル情報表示
    let levelMessage = `Lv. ${levelInput.value} のステータスを検証しました。`;
    if (levelInput.value > finalMaxLevel || levelInput.value < 1) {
        // 現Lvの入力値が不正な場合、エラーメッセージを表示
        levelMessage = `入力された現Lv. ${levelInput.value} は不正ですが、計算は最大Lv. ${finalMaxLevel} で行っています。`;
    } else {
        levelMessage = `入力された現Lv. ${levelInput.value} のステータスは、最大Lv. ${finalMaxLevel} で計算しています。`;
    }
    
    document.getElementById('level-info').textContent = levelMessage;
    document.getElementById('max-level-info').textContent = 
        `現在の最大レベル: ${finalMaxLevel} (初期Lv.${baseMaxLevel} + 覚醒ボーナス ${bonusMaxLevel} )`;
    
    if (!isSilent) {
        if (isLevelCorrected) {
             document.getElementById('result-message').textContent = '⚠️ 入力レベルが上限を超えていたため、最大レベルに補正しました。';
        } else if (corrected) {
             // マイナス補正が行われた場合は、すでにメッセージが出ているため何もしない
        } else {
             document.getElementById('result-message').textContent = '覚醒ボーナス、アクセサリ、成長型を適用し、最大レベルでのステータスを推測しました。';
        }
    }
    
    // 最終ステータス表示
    document.getElementById('final-hp').textContent = `体力 (HP): ${finalHp} (Lv.1時: ${currentLv1Hp})`;
    document.getElementById('final-atk').textContent = `攻撃 (ATK): ${finalAtk} (Lv.1時: ${currentLv1Atk})`;
    document.getElementById('final-spd').textContent = `速さ (SPD): ${finalSpd} (Lv.1時: ${currentLv1Spd})`;
    
    
    // ----------------------------------------------------------------
    // 7. デバッグ情報のUI出力
    // ----------------------------------------------------------------
    const debugOutput = 
`[カード情報]
  レアリティ初期Lv: ${baseMaxLevel}
  覚醒回数: ${awakeningCount} / 上限: ${maxAwakening}
  最終Lv上限: ${finalMaxLevel} (計算使用レベル)

[成長型 (LvUP毎)]
  ${selectedGrowthOption.textContent}
  LvUP回数: ${levelDifference} 回
  HP増加: ${growthHpPerLevel} × ${levelDifference} = +${totalGrowthHp}
  ATK増加: ${growthAtkPerLevel} × ${levelDifference} = +${totalGrowthAtk}
  SPD増加: ${growthSpdPerLevel} × ${levelDifference} = +${totalGrowthSpd}

[アクセサリ補正]
  種類: ${selectedAccessoryOption.textContent}
  純粋な補正値: HP+${accessoryHp}, ATK+${accessoryAtk}, SPD+${accessorySpd}

[Lv.1ステータス計算]
  手入力Lv.1: HP=${baseHp}, ATK=${baseAtk}, SPD=${baseSpd}
  累積覚醒ボーナス: HP+${totalBonusHp}, ATK+${totalBonusAtk}, SPD+${totalBonusSpd}
  計算後Lv.1 (補正済): HP=${currentLv1Hp}, ATK=${currentLv1Atk}, SPD=${currentLv1Spd}

[推測結果 (最終)]
  HP: ${currentLv1Hp} + ${totalGrowthHp} = ${finalHp}
  ATK: ${currentLv1Atk} + ${totalGrowthAtk} = ${finalAtk}
  SPD: ${currentLv1Spd} + ${totalGrowthSpd} = ${finalSpd}`;
    
    document.getElementById('debug-output').textContent = debugOutput;
}

// ページロード時にも一度レベル情報を表示 (初期値の確認用)
document.addEventListener('DOMContentLoaded', () => {
    // レベル初期値を1に設定
    document.getElementById('level').value = 1;
    // 初回実行 (サイレントモード)
    calculateStatus(true); 
    // デバッグ情報を初期状態で非表示にする
    document.getElementById('debug-output').style.display = 'none';
});