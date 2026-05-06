// Egern generic script for an iOS widget that shows CIII Codex usage.
// V4.1 - React/Tailwind Inspired Ultra-Density Dashboard (All Sizes + Countdown)
//
// Required env:
//   API_KEY      -> your API key(s). For multiple keys, separate with a comma (key1,key2)
// Optional env:
//   BASE_URL     -> default https://codex.ciii.club
//   OPEN_URL     -> tap target, default https://codex.ciii.club/usage
//   TITLE        -> widget title, default 中转站监控

function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function firstPath(obj, paths, fallback = null) {
  for (const path of paths) {
    const value = getPath(obj, path);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function fmtInt(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num(value));
}

function formatMoney(val) {
  return `$${num(val).toFixed(2)}`;
}

function formatCompact(numVal) {
  const n = num(numVal);
  if (n >= 1e8) return (n / 1e8).toFixed(2) + ' 亿';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isoAfterMinutes(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function getResetCountdown() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  const diff = tomorrow - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m 后重置`;
}

const PALETTE = {
  bgGradient: ['#27272A', '#18181B', '#09090B'],
  cardBg: '#FFFFFF0C',
  emerald: '#34D399',
  indigo: '#4F46E5',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  textFaint: '#475569'
};

const BRAND_ICON_SRC = 'data:image/png;base64,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';

function buildBetweenRow(leftChild, rightChild) {
  return {
    type: 'stack',
    direction: 'row',
    alignItems: 'center',
    children: [
      leftChild,
      { type: 'spacer' },
      rightChild
    ]
  };
}

function buildCenteredRow(children, padding = null) {
  return {
    type: 'stack',
    direction: 'row',
    alignItems: 'center',
    ...(padding ? { padding } : {}),
    children: [
      { type: 'spacer' },
      ...children,
      { type: 'spacer' }
    ]
  };
}

function buildBrandBadge() {
  return {
    type: 'stack',
    backgroundColor: PALETTE.indigo,
    padding: [4, 4, 4, 4],
    borderRadius: 6,
    children: [{ type: 'image', src: BRAND_ICON_SRC, width: 12, height: 12 }]
  };
}

function buildPlanHeader(planName) {
  return {
    type: 'stack',
    direction: 'row',
    alignItems: 'center',
    children: [
      buildBrandBadge(),
      { type: 'spacer', length: 6 },
      { type: 'text', text: planName, font: { size: 10, weight: 'bold' }, textColor: PALETTE.textMuted, flex: 1, minScale: 0.8 }
    ]
  };
}

function buildResetRow(padding = [2, 0, 0, 0]) {
  return buildCenteredRow([
    { type: 'image', src: 'sf-symbol:clock.arrow.circlepath', color: '#71717A', width: 8, height: 8 },
    { type: 'spacer', length: 3 },
    { type: 'text', text: getResetCountdown(), font: { size: 8, weight: 'bold' }, textColor: '#71717A' }
  ], padding);
}

function buildAccountFingerprint(data, planName, remaining, dailyLimit, expiresAt) {
  const explicitId = firstPath(data, [
    'account.id',
    'accountId',
    'subscription.id',
    'subscriptionId',
    'organization.id',
    'organizationId',
    'user.id',
    'userId'
  ], null);

  if (explicitId) return String(explicitId);

  return [
    planName || '--',
    expiresAt || '--',
    num(remaining).toFixed(6),
    num(dailyLimit).toFixed(6)
  ].join('|');
}

function getWidgetCacheKey(widgetFamily) {
  return `ciii-codex-widget-cache:${widgetFamily || 'default'}`;
}

function readCachedWidget(ctx) {
  try {
    return ctx.storage?.getJSON?.(getWidgetCacheKey(ctx.widgetFamily)) || null;
  } catch {
    return null;
  }
}

function writeCachedWidget(ctx, widgetDsl) {
  try {
    ctx.storage?.setJSON?.(getWidgetCacheKey(ctx.widgetFamily), widgetDsl);
  } catch {
    // Ignore cache write failures and continue rendering live data.
  }
}

function buildProgressBar(usage, limit, showReset = true) {
  const percent = limit > 0 ? Math.min(100, Math.round((usage / limit) * 100)) : 0;
  
  const barChildren = [];
  if (percent > 0) {
    barChildren.push({
      type: 'stack',
      flex: percent,
      backgroundColor: PALETTE.emerald,
      borderRadius: 4,
      children: [{ type: 'spacer' }]
    });
  }
  if (percent < 100) {
    barChildren.push({ type: 'stack', flex: 100 - percent, children: [{ type: 'spacer' }] });
  }
  if (barChildren.length === 0) {
    barChildren.push({ type: 'spacer' });
  }

  const textRowChildren = [
    { type: 'text', text: `今日消耗 ${formatMoney(usage)}`, font: { size: 9, weight: 'medium' }, textColor: PALETTE.emerald },
    { type: 'text', text: `上限 ${formatMoney(limit)}`, font: { size: 9, weight: 'medium' }, textColor: PALETTE.textFaint }
  ];

  return {
    type: 'stack',
    direction: 'column',
    gap: 4,
    children: [
      buildBetweenRow(textRowChildren[0], textRowChildren[1]),
      {
        type: 'stack',
        height: 5,
        backgroundColor: '#FFFFFF1A',
        borderRadius: 4,
        children: barChildren
      },
      showReset ? buildResetRow() : null
    ].filter(Boolean)
  };
}

function buildGridCard(icon, title, hugeVal, tinyVal = null, tinyUnit = null) {
  return {
    type: 'stack',
    direction: 'column',
    flex: 1,
    backgroundColor: PALETTE.cardBg,
    borderRadius: 14,
    padding: [8, 10, 8, 10],
    gap: 2,
    children: [
      { type: 'spacer' },
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 4,
        children: [
          { type: 'image', src: icon, color: '#A1A1AA', width: 9, height: 9 },
          { type: 'text', text: title, font: { size: 8, weight: 'bold' }, textColor: '#A1A1AA' }
        ]
      },
      { type: 'spacer', length: 2 },
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'end',
        gap: 2,
        children: [
          { type: 'text', text: hugeVal, font: { size: 14, weight: 'heavy', family: 'Menlo' }, textColor: '#FFFFFF', minScale: 0.5 },
          tinyUnit ? { type: 'text', text: tinyUnit, font: { size: 8, weight: 'bold' }, textColor: '#71717A' } : null
        ].filter(Boolean)
      },
      tinyVal ? { type: 'text', text: tinyVal, font: { size: 8, weight: 'bold', family: 'Menlo' }, textColor: '#71717A', minScale: 0.5 } : null,
      { type: 'spacer' }
    ].filter(Boolean)
  };
}

function buildSmallWidget(planName, remaining, dailyCost, dailyLimit, openUrl) {
  return {
    type: 'widget',
    url: openUrl,
    padding: 16,
    gap: 0,
    backgroundGradient: { type: 'linear', colors: PALETTE.bgGradient, stops: [0, 0.5, 1], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } },
    refreshAfter: isoAfterMinutes(15),
    children: [
      {
        ...buildPlanHeader(planName)
      },
      { type: 'spacer', length: 12 },
      { type: 'text', text: '可用余额', font: { size: 10, weight: 'bold' }, textColor: PALETTE.textFaint },
      { type: 'spacer', length: 2 },
      { type: 'text', text: formatMoney(remaining), font: { size: 28, weight: 'heavy', family: 'Menlo' }, textColor: '#FFFFFF', minScale: 0.3 },
      { type: 'spacer' },
      buildProgressBar(dailyCost, dailyLimit, true)
    ]
  };
}

function buildMediumWidget(planName, remaining, dailyCost, dailyLimit, todayTokens, totalTokens, requests, avgLatencyMs, expiresAt, openUrl) {
  const leftCol = {
    type: 'stack',
    direction: 'column',
    flex: 85,
    gap: 0,
    alignItems: 'start',
    children: [
      buildPlanHeader(planName),
      { type: 'spacer', length: 10 },
      { type: 'text', text: '可用余额', font: { size: 9, weight: 'bold' }, textColor: PALETTE.textFaint },
      { type: 'spacer', length: 2 },
      { type: 'spacer' },
      { type: 'text', text: formatMoney(remaining), font: { size: 30, weight: 'heavy', family: 'Menlo' }, textColor: '#FFFFFF', minScale: 0.3 },
      { type: 'spacer', length: 2 },
      { type: 'text', text: `累计用量 ${formatCompact(totalTokens)}`, font: { size: 9, weight: 'bold' }, textColor: PALETTE.textMuted },
      { type: 'spacer' },
      buildProgressBar(dailyCost, dailyLimit, true)
    ]
  };

  const rightCol = {
    type: 'stack',
    direction: 'column',
    flex: 115,
    gap: 8,
    children: [
      {
        type: 'stack',
        direction: 'row',
        gap: 8,
        flex: 1,
        children: [
          buildGridCard('sf-symbol:waveform.path.ecg', 'TOKENS', formatCompact(todayTokens), fmtInt(todayTokens)),
          buildGridCard('sf-symbol:bolt.fill', '请求数', fmtInt(requests))
        ]
      },
      {
        type: 'stack',
        direction: 'row',
        gap: 8,
        flex: 1,
        children: [
          buildGridCard('sf-symbol:clock.fill', '平均响应', (avgLatencyMs / 1000).toFixed(1), null, 's'),
          buildGridCard('sf-symbol:calendar', '订阅到期', formatDate(expiresAt))
        ]
      }
    ]
  };

  return {
    type: 'widget',
    url: openUrl,
    padding: 16,
    backgroundGradient: { type: 'linear', colors: PALETTE.bgGradient, stops: [0, 0.5, 1], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } },
    refreshAfter: isoAfterMinutes(15),
    children: [
      {
        type: 'stack',
        direction: 'row',
        flex: 1,
        gap: 12,
        children: [
          leftCol,
          rightCol
        ]
      }
    ]
  };
}

function buildLargeWidget(planName, remaining, dailyCost, dailyLimit, todayTokens, totalTokens, requests, avgLatencyMs, expiresAt, openUrl, topModels) {
  const topLeftCol = {
    type: 'stack',
    direction: 'column',
    flex: 85,
    gap: 0,
    alignItems: 'start',
    children: [
      buildPlanHeader(planName),
      { type: 'spacer', length: 10 },
      { type: 'text', text: '可用余额', font: { size: 9, weight: 'bold' }, textColor: PALETTE.emerald },
      { type: 'spacer', length: 2 },
      { type: 'spacer' },
      { type: 'text', text: formatMoney(remaining), font: { size: 30, weight: 'heavy', family: 'Menlo' }, textColor: '#FFFFFF', minScale: 0.3 },
      { type: 'spacer' },
      buildResetRow(null)
    ]
  };

  const topRightCol = {
    type: 'stack',
    direction: 'column',
    flex: 115,
    gap: 8,
    children: [
      {
        type: 'stack',
        direction: 'row',
        gap: 8,
        flex: 1,
        children: [
          buildGridCard('sf-symbol:waveform.path.ecg', 'TOKENS', formatCompact(todayTokens), fmtInt(todayTokens)),
          buildGridCard('sf-symbol:bolt.fill', '请求数', fmtInt(requests))
        ]
      },
      {
        type: 'stack',
        direction: 'row',
        gap: 8,
        flex: 1,
        children: [
          buildGridCard('sf-symbol:clock.fill', '平均响应', (avgLatencyMs / 1000).toFixed(1), null, 's'),
          buildGridCard('sf-symbol:calendar', '订阅到期', formatDate(expiresAt))
        ]
      }
    ]
  };

  const bottomLeftCol = {
    type: 'stack',
    direction: 'column',
    flex: 1,
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    padding: [12, 12, 12, 12],
    children: [
      { type: 'spacer' },
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 4,
        children: [
          { type: 'image', src: 'sf-symbol:chart.bar', color: PALETTE.textMuted, width: 10, height: 10 },
          { type: 'text', text: '使用量趋势', font: { size: 10, weight: 'bold' }, textColor: PALETTE.textMuted }
        ]
      },
      { type: 'spacer', length: 12 },
      buildBetweenRow(
        { type: 'text', text: `已用 ${formatMoney(dailyCost)}`, font: { size: 10, weight: 'bold' }, textColor: PALETTE.emerald },
        { type: 'text', text: `上限 ${formatMoney(dailyLimit)}`, font: { size: 10, weight: 'bold' }, textColor: PALETTE.textFaint }
      ),
      { type: 'spacer', length: 6 },
      (function() {
        let percent = 0;
        if (dailyLimit > 0) percent = Math.min(100, Math.round((dailyCost / dailyLimit) * 100));
        let barChildren = [];
        if (percent > 0) {
          barChildren.push({ type: 'stack', flex: percent, backgroundColor: PALETTE.emerald, borderRadius: 3, children: [{ type: 'spacer' }] });
        }
        if (percent < 100) {
          barChildren.push({ type: 'stack', flex: 100 - percent, children: [{ type: 'spacer' }] });
        }
        if (barChildren.length === 0) barChildren.push({ type: 'spacer' });

        return {
          type: 'stack',
          height: 6,
          backgroundColor: '#00000066',
          borderRadius: 3,
          children: barChildren
        };
      })(),
      { type: 'spacer', length: 16 },
      { type: 'text', text: formatCompact(totalTokens), font: { size: 12, weight: 'heavy', family: 'Menlo' }, textColor: '#FFF' },
      { type: 'spacer', length: 2 },
      { type: 'text', text: '全量历史总 Tokens', font: { size: 8, weight: 'semibold' }, textColor: '#71717A' },
      { type: 'spacer' }
    ]
  };

  const modelsChildren = [
    {
      type: 'stack',
      direction: 'row',
      alignItems: 'center',
      gap: 4,
      children: [
        { type: 'image', src: 'sf-symbol:flame.fill', color: PALETTE.textMuted, width: 10, height: 10 },
        { type: 'text', text: '消耗 Top 3 (USD)', font: { size: 10, weight: 'bold' }, textColor: PALETTE.textMuted }
      ]
    },
    { type: 'spacer', length: 10 }
  ];

  const rankColors = ['#F59E0B', '#94A3B8', '#B45309'];
  
  if (!topModels || topModels.length === 0) {
    modelsChildren.push({ type: 'text', text: '暂无模型数据', font: { size: 10, weight: 'bold' }, textColor: PALETTE.textFaint });
  } else {
    for (let i = 0; i < topModels.length; i++) {
      const model = topModels[i];
      const color = rankColors[i] || PALETTE.textFaint;
      modelsChildren.push({
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        padding: [3, 0, 3, 0],
        children: [
          {
            type: 'stack',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 3,
            padding: [2, 4, 2, 4],
            children: [{ type: 'text', text: `${i + 1}`, font: { size: 8, weight: 'heavy' }, textColor: color }]
          },
          { type: 'spacer', length: 6 },
          { type: 'text', text: model.name, font: { size: 10, weight: 'bold' }, textColor: '#E2E8F0', minScale: 0.8 },
          { type: 'spacer' },
          { type: 'text', text: `$${model.cost.toFixed(0)}`, font: { size: 10, weight: 'heavy', family: 'Menlo' }, textColor: PALETTE.emerald }
        ]
      });
      if (i < topModels.length - 1) {
        modelsChildren.push({ type: 'spacer', length: 4 });
      }
    }
  }

  const bottomRightCol = {
    type: 'stack',
    direction: 'column',
    flex: 1,
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    padding: [12, 12, 12, 12],
    children: modelsChildren
  };

  return {
    type: 'widget',
    url: openUrl,
    padding: 14,
    backgroundGradient: { type: 'linear', colors: PALETTE.bgGradient, stops: [0, 0.5, 1], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } },
    refreshAfter: isoAfterMinutes(15),
    children: [
      {
        type: 'stack',
        direction: 'row',
        flex: 1,
        gap: 12,
        children: [topLeftCol, topRightCol]
      },
      { type: 'spacer', length: 12 },
      {
        type: 'stack',
        direction: 'row',
        flex: 1,
        gap: 12,
        children: [bottomLeftCol, bottomRightCol]
      }
    ]
  };
}

function buildErrorWidget(title, message, openUrl) {
  return {
    type: 'widget',
    url: openUrl,
    padding: 16,
    backgroundGradient: { type: 'linear', colors: ['#2C1A1A', '#1C1010', '#000000'], stops: [0, 0.5, 1], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } },
    refreshAfter: isoAfterMinutes(15),
    children: [
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 6,
        children: [
          { type: 'image', src: 'sf-symbol:xmark.octagon.fill', color: '#FF3B30', width: 14, height: 14 },
          { type: 'text', text: title, font: { size: 12, weight: 'heavy' }, textColor: '#E5E5E5' }
        ]
      },
      { type: 'spacer', length: 14 },
      { type: 'text', text: '获取监控数据失败', font: { size: 14, weight: 'bold' }, textColor: '#FFFFFF' },
      { type: 'spacer', length: 6 },
      { type: 'text', text: message, font: { size: 11, weight: 'medium' }, textColor: '#FF6961', maxLines: 4 }
    ]
  };
}

export default async function(ctx) {
  const baseUrl = (ctx.env.BASE_URL || 'https://codex.ciii.club').replace(/\/$/, '');
  const openUrl = ctx.env.OPEN_URL || `${baseUrl}/usage`;
  const defaultTitle = ctx.env.TITLE || 'Ciii Codex监控';
  const rawApiKeys = ctx.env.API_KEY || '';
  const requestTimeoutMs = Math.max(1000, Math.min(num(ctx.env.REQUEST_TIMEOUT_MS, 3500), 9000));
  
  const apiKeys = rawApiKeys.split(',').map(k => k.trim()).filter(Boolean);

  if (apiKeys.length === 0) {
    return buildErrorWidget(defaultTitle, '请配置 API_KEY 环境变数。如有多个，请用逗号隔开。', openUrl);
  }

  try {
    const fetchPromises = apiKeys.map(key => 
      ctx.http.get(`${baseUrl}/v1/usage`, {
        headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
        timeout: requestTimeoutMs,
        credentials: 'omit'
      })
    );

    const results = await Promise.allSettled(fetchPromises);

    let aggregatedTodayTokens = 0;
    let aggregatedTotalTokens = 0;
    let aggregatedRemaining = 0;
    let aggregatedDailyLimit = 0;
    let aggregatedDailyCost = 0;
    let aggregatedRequests = 0;
    
    let aggregatedPlanNames = [];
    let minExpiresAt = null;
    let aggregatedAvgDurationMs = 0;
    let aggregatedDurationWeight = 0;
    let validKeysCount = 0;
    let uniqueAccountsCount = 0;
    const seenAccounts = new Set();
    const modelStatsMap = new Map();
    
    let hasValidData = false;
    let errorMessage = '';

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const resp = result.value;
        if (resp.status >= 200 && resp.status < 300) {
          validKeysCount++;
          const data = await resp.json();
          hasValidData = true;

          const planName = firstPath(data, ['planName'], '未命名订阅');
          const expRaw = firstPath(data, ['subscription.expires_at'], null);
          const remainingRaw = firstPath(data, ['remaining', 'quota.remaining', 'balance.remaining'], 0);
          const totalTokens = firstPath(data, ['usage.total.total_tokens', 'total.total_tokens'], 0);
          const dailyLimit = firstPath(data, ['subscription.daily_limit_usd'], 0);
          const dailyCost = firstPath(data, ['subscription.daily_usage_usd', 'usage.today.cost', 'usage.today.actual_cost'], 0);
          const reqs = num(firstPath(data, ['usage.today.requests'], 0));
          const duration = num(firstPath(data, ['usage.average_duration_ms'], 0));
          const todayInput = firstPath(data, ['usage.today.input_tokens', 'today.input_tokens'], 0);
          const todayOutput = firstPath(data, ['usage.today.output_tokens', 'today.output_tokens'], 0);
          const todayTotal = firstPath(data, ['usage.today.total_tokens', 'today.total_tokens'], num(todayInput) + num(todayOutput));
          const accountFingerprint = buildAccountFingerprint(data, planName, remainingRaw, dailyLimit, expRaw);

          if (seenAccounts.has(accountFingerprint)) {
            continue;
          }
          seenAccounts.add(accountFingerprint);
          
          uniqueAccountsCount++;
          if (!aggregatedPlanNames.includes(planName)) aggregatedPlanNames.push(planName);

          if (expRaw) {
            const expDate = new Date(expRaw);
            if (!minExpiresAt || expDate < minExpiresAt) minExpiresAt = expDate;
          }

          const durationWeight = reqs > 0 ? reqs : 1;
          if (duration > 0) {
            aggregatedAvgDurationMs += duration * durationWeight;
            aggregatedDurationWeight += durationWeight;
          }

          aggregatedTodayTokens += num(todayTotal);
          aggregatedTotalTokens += num(totalTokens);
          aggregatedRemaining += num(remainingRaw);
          aggregatedDailyLimit += num(dailyLimit);
          aggregatedDailyCost += num(dailyCost);
          aggregatedRequests += reqs;

          const modelStats = firstPath(data, ['model_stats'], []);
          if (Array.isArray(modelStats)) {
            for (const stat of modelStats) {
              if (stat.model && stat.cost !== undefined) {
                const currentCost = modelStatsMap.get(stat.model) || 0;
                modelStatsMap.set(stat.model, currentCost + num(stat.cost));
              }
            }
          }
        } else {
          errorMessage = `HTTP 错误 ${resp.status}`;
        }
      } else {
        errorMessage = '网络请求失败或超时';
      }
    }

    if (!hasValidData) {
      return readCachedWidget(ctx) || buildErrorWidget(defaultTitle, errorMessage || '未获取到有效数据', openUrl);
    }

    const finalPlanName = validKeysCount > 1 ? `${defaultTitle} (${validKeysCount} Key)` : defaultTitle;
    const finalAvgDuration = aggregatedDurationWeight > 0 ? (aggregatedAvgDurationMs / aggregatedDurationWeight) : 0;
    const finalExpiresAt = minExpiresAt ? minExpiresAt.toISOString() : null;
    let widgetDsl;

    if (ctx.widgetFamily === 'systemSmall' || ctx.widgetFamily === 'accessoryCircular') {
      widgetDsl = buildSmallWidget(
        finalPlanName, aggregatedRemaining, aggregatedDailyCost, aggregatedDailyLimit, openUrl
      );
    } else if (ctx.widgetFamily === 'systemMedium') {
      widgetDsl = buildMediumWidget(finalPlanName, aggregatedRemaining, aggregatedDailyCost, aggregatedDailyLimit, aggregatedTodayTokens, aggregatedTotalTokens, aggregatedRequests, finalAvgDuration, finalExpiresAt, openUrl);
    } else if (ctx.widgetFamily === 'systemLarge') {
      const topModels = Array.from(modelStatsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => {
          let name = entry[0];
          if (name.startsWith('gpt-5.3-')) name = name.replace('gpt-5.3-', '');
          if (name.startsWith('gpt-5.1-')) name = name.replace('gpt-5.1-', '');
          if (name.length > 12) name = name.substring(0, 10) + '..';
          return { name, cost: entry[1] };
        });
      widgetDsl = buildLargeWidget(finalPlanName, aggregatedRemaining, aggregatedDailyCost, aggregatedDailyLimit, aggregatedTodayTokens, aggregatedTotalTokens, aggregatedRequests, finalAvgDuration, finalExpiresAt, openUrl, topModels);
    } else {
      widgetDsl = buildMediumWidget(finalPlanName, aggregatedRemaining, aggregatedDailyCost, aggregatedDailyLimit, aggregatedTodayTokens, aggregatedTotalTokens, aggregatedRequests, finalAvgDuration, finalExpiresAt, openUrl);
    }

    writeCachedWidget(ctx, widgetDsl);
    return widgetDsl;
  } catch (error) {
    return readCachedWidget(ctx) || buildErrorWidget(defaultTitle, error?.message || String(error), openUrl);
  }
}
