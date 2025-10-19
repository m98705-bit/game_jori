// 成長型ごとの補正係数（前の回答の仮定値）
const GROWTH_BONUS = {
    "HA型": {"HP": 1.2, "ATK": 1.1, "SPD": 0.8},
    "AS型": {"HP": 0.9, "ATK": 1.1, "SPD": 1.2},
    "SS型": {"HP": 0.8, "ATK": 0.9, "SPD": 1.3},
    "ALL": {"HP": 1.0, "ATK": 1.0, "SPD": 1.0}
};

// ----------------------------------------------------
// UIから値を取得し、計算を実行して表示するメイン関数
// ----------------------------------------------------
function calculateAndDisplay() {
    // 1. UIから入力値を取得
    const initialHP = parseInt(document.getElementById('initial_hp').value);
    const initialATK = parseInt(document.getElementById('initial_atk').value);
    const initialSPD = parseInt(document.getElementById('initial_spd').value);
    
    const maxLevel = 100; // 例として最大レベルを100に固定
    const targetLevel = parseInt(document.getElementById('target_level').value);
    const cardType = document.getElementById('card_type').value;

    const targetIncreaseHP = parseInt(document.getElementById('target_increase_hp').value);
    // ... 攻撃力と速さの目標上昇値もUIから取得する必要があります ...

    // 簡略化のため、ここでは目標上昇値を固定値として仮定します
    const targetIncrease = {
        "HP": targetIncreaseHP,
        "ATK": targetIncreaseHP * 0.8, // 例: 攻撃力は体力目標の80%
        "SPD": targetIncreaseHP * 0.6  // 例: 速さは体力目標の60%
    };

    // 2. ステータス計算 (前の回答のロジックをベースに)
    const resultStats = calculateStats(
        { "HP": initialHP, "ATK": initialATK, "SPD": initialSPD },
        maxLevel, 
        targetIncrease, 
        cardType, 
        targetLevel
    );

    // 3. UIに結果を表示
    document.getElementById('display_level').textContent = targetLevel;
    document.getElementById('result_hp').textContent = resultStats.HP.toLocaleString();
    document.getElementById('result_atk').textContent = resultStats.ATK.toLocaleString();
    document.getElementById('result_spd').textContent = resultStats.SPD.toLocaleString();
}

// ----------------------------------------------------
// 💡 ステータス計算ロジック (前の回答の疑似コード)
// ----------------------------------------------------
function calculateStats(base_stats, max_level, target_increase, card_type, target_level) {
    let current_stats = base_stats;
    const levels_to_grow = max_level - 1;
    const bonus = GROWTH_BONUS[card_type] || {"HP": 1.0, "ATK": 1.0, "SPD": 1.0};
    
    if (target_level <= 1) return base_stats;
    if (target_level > max_level) target_level = max_level;

    let final_stats = {};

    for (const stat_key of ["HP", "ATK", "SPD"]) {
        // 1. 基礎的な1レベルあたりの平均成長値
        const base_growth_per_level = target_increase[stat_key] / levels_to_grow;
        
        # 2. 成長型ボーナスを適用
        const adjusted_growth_per_level = base_growth_per_level * bonus[stat_key];
        
        # 3. 指定レベルまでの総上昇量を計算
        const total_increase = adjusted_growth_per_level * (target_level - 1);
        
        # 4. 最終ステータス = 初期ステータス + 総上昇量
        let final_value = base_stats[stat_key] + total_increase;
        
        # 最終値を整数に丸める
        final_stats[stat_key] = Math.round(final_value);
    }
    
    return final_stats;
}