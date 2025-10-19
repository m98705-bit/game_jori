/**
 * 覚醒回数やレアリティが変更されたときにレベルを1にリセットする関数
 */
function resetLevel() {
    const levelInput = document.getElementById('level');
    
    // 覚醒するとレベルが1に戻るルールを適用
    if (levelInput) {
        levelInput.value = 1;
        
        // ユーザーに視覚的にレベル上限情報を更新させるために計算を軽く実行（任意）
        calculateStatus(true); 
    }
}


/**
 * メインのステータス推測を実行する関数
 */
function calculateStatus(isSilent = false) {
    // ----------------------------------------------------------------
    // 1. 入力値の取得
    // ----------------------------------------------------------------
    const levelInput = document.getElementById('level').value;
    const awakeningInput = document.getElementById('awakening').value; 
    const raritySelect = document.getElementById('rarity');
    
    const selectedOption = raritySelect.options[raritySelect.selectedIndex];

    // レアリティごとの基本レベル上限と覚醒上限回数を取得
    const baseMaxLevel = parseInt(raritySelect.value, 10);
    const maxAwakening = parseInt(selectedOption.getAttribute('data-awakening-limit'), 10); 
    
    // 覚醒回数を数値に変換
    let awakeningCount = parseInt(awakeningInput, 10) || 0;

    // レベルを数値に変換
    let level = parseInt(levelInput, 10) || 1; 

    // ----------------------------------------------------------------
    // 2. 覚醒回数の検証と補正 (N～Legend: レア度+17回が上限)
    // ----------------------------------------------------------------
    if (awakeningCount > maxAwakening) {
        awakeningCount = maxAwakening; // 上限値に補正
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
    // 3. 最終レベル上限の計算とレベルの検証
    // ----------------------------------------------------------------
    // 覚醒1回あたり、レベル上限が 5 上昇
    const bonusMaxLevel = awakeningCount * 5; 
    const finalMaxLevel = baseMaxLevel + bonusMaxLevel; 

    let levelMessage = `現在のレベル上限: ${finalMaxLevel}`;
    let isLevelCorrected = false;

    // レベルの下限 (1) をチェック
    if (level < 1) {
        level = 1;
        document.getElementById('level').value = 1;
        isLevelCorrected = true;
    }

    // レベルの上限をチェック
    if (level > finalMaxLevel) {
        level = finalMaxLevel; // 上限値に補正
        document.getElementById('level').value = finalMaxLevel;
        isLevelCorrected = true;
        levelMessage += ` (⚠️ レベルが上限を超えていたため、${finalMaxLevel}に補正)`;
    }
    
    // ----------------------------------------------------------------
    // 4. 結果の表示
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
    // 5. ステータス推測計算の実行 (ここに実際の推測ロジックを実装)
    // ----------------------------------------------------------------
    
    // 例: 補正後の level と awakeningCount を使用して推測計算を実行
    // const finalStatus = performPrediction(level, awakeningCount, ...他の入力値);
    // document.getElementById('actual-status-result').textContent = finalStatus;

    // ※ 注意: 現在のコードでは実際のステータス推測ロジックは含まれていません。
    //   計算に必要なデータ（Lv1ステータス、成長率など）が揃ったら、ここに実装してください。
}

// ページロード時にも一度レベル情報を表示 (初期値の確認用)
document.addEventListener('DOMContentLoaded', () => {
    calculateStatus(true); // 初期表示はメッセージなし (isSilent=true) で実行
});