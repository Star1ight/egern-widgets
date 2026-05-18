import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import widget from '../src/widget.js';

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function makeUsageResponse(overrides = {}) {
  const base = {
    planName: 'Ciii Pro',
    remaining: 211,
    model_stats: [
      { model: 'gpt-5.5', cost: 100 },
      { model: 'gpt-5.4', cost: 50 },
      { model: 'gpt-5.3-codex', cost: 10 }
    ],
    usage: {
      average_duration_ms: 320,
      today: {
        total_tokens: 1200,
        requests: 3,
        cost: 150
      },
      total: {
        total_tokens: 12000
      }
    },
    subscription: {
      daily_limit_usd: 600,
      daily_usage_usd: 150,
      expires_at: '2026-08-21T00:00:00.000Z'
    }
  };

  return {
    ...base,
    ...overrides,
    usage: {
      ...base.usage,
      ...overrides.usage,
      today: {
        ...base.usage.today,
        ...overrides.usage?.today
      },
      total: {
        ...base.usage.total,
        ...overrides.usage?.total
      }
    },
    subscription: {
      ...base.subscription,
      ...overrides.subscription
    }
  };
}

function makeCtx(widgetFamily = 'systemMedium', responsesByKey = {}) {
  const apiKeys = Object.keys(responsesByKey);
  const envKeys = apiKeys.length > 0 ? apiKeys.join(',') : 'alpha';

  return {
    env: {
      API_KEY: envKeys,
      TITLE: 'Ciii Codex监控',
      OPEN_URL: 'https://example.com/usage'
    },
    widgetFamily,
    http: {
      async get(_url, options = {}) {
        const auth = options.headers?.Authorization || '';
        const key = auth.replace(/^Bearer\s+/u, '');
        const response = responsesByKey[key] || makeUsageResponse();
        return {
          status: 200,
          async json() {
            return clone(response);
          }
        };
      }
    }
  };
}

function collectText(node, result = []) {
  if (!node || typeof node !== 'object') return result;
  if (typeof node.text === 'string') result.push(node.text);
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectText(child, result);
  }
  return result;
}

function visitNodes(node, visitor) {
  if (!node || typeof node !== 'object') return;
  visitor(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) visitNodes(child, visitor);
  }
}

test('large widget output stays within documented Egern widget schema', async () => {
  const output = await widget(makeCtx('systemLarge', {
    alpha: makeUsageResponse()
  }));

  visitNodes(output, (node) => {
    assert.equal(
      'justifyContent' in node,
      false,
      `Unsupported justifyContent found on node: ${JSON.stringify(node)}`
    );

    assert.notEqual(
      node.alignItems,
      'baseline',
      `Unsupported baseline alignment found on node: ${JSON.stringify(node)}`
    );

    if (node.type === 'image') {
      assert.match(
        node.src,
        /^(sf-symbol:|data:)/u,
        `Image src must use sf-symbol: or data: URI: ${node.src}`
      );
    }

    if (node.font) {
      assert.equal(
        'design' in node.font,
        false,
        `Unsupported font.design found on node: ${JSON.stringify(node)}`
      );
    }

    if (node.type === 'spacer') {
      assert.notEqual(
        node.length,
        null,
        `Spacer length cannot be null: ${JSON.stringify(node)}`
      );
    }

    if (Array.isArray(node.children)) {
      assert.equal(
        node.children.some((child) => child === null),
        false,
        `Children array cannot contain null: ${JSON.stringify(node)}`
      );
    }
  });
});

test('medium widget deduplicates subscription fields while summing per-key usage', async () => {
  const output = await widget(makeCtx('systemMedium', {
    alpha: makeUsageResponse({
      remaining: 211,
      usage: {
        average_duration_ms: 120,
        today: { total_tokens: 1000, requests: 2, cost: 999 },
        total: { total_tokens: 1000 }
      },
      subscription: {
        daily_limit_usd: 600,
        daily_usage_usd: 150,
        expires_at: '2026-08-21T00:00:00.000Z'
      }
    }),
    beta: makeUsageResponse({
      remaining: 211,
      usage: {
        average_duration_ms: 120,
        today: { total_tokens: 1000, requests: 2, cost: 888 },
        total: { total_tokens: 1000 }
      },
      subscription: {
        daily_limit_usd: 600,
        daily_usage_usd: 150,
        expires_at: '2026-08-21T00:00:00.000Z'
      }
    }),
    gamma: makeUsageResponse({
      planName: 'Ciii Team',
      remaining: 377,
      usage: {
        average_duration_ms: 480,
        today: { total_tokens: 3000, requests: 6, cost: 777 },
        total: { total_tokens: 3000 }
      },
      subscription: {
        daily_limit_usd: 900,
        daily_usage_usd: 50,
        expires_at: '2026-09-15T00:00:00.000Z'
      }
    })
  }));

  const text = collectText(output).join(' ');

  assert.match(text, /可用余额/u);
  assert.match(text, /\$588\.00/u);
  assert.match(text, /今日消耗 \$200\.00/u);
  assert.match(text, /上限 \$1500\.00/u);
  assert.match(text, /累计用量 5\.0K/u);
  assert.match(text, /TOKENS 5\.0K 5,000/u);
  assert.match(text, /请求数 10/u);
  assert.doesNotMatch(text, /\$799\.00/u);
  assert.doesNotMatch(text, /今日消耗 \$350\.00/u);
  assert.doesNotMatch(text, /上限 \$2100\.00/u);
});

test('medium widget sums per-key totals under one shared subscription', async () => {
  const output = await widget(makeCtx('systemMedium', {
    alpha: makeUsageResponse({
      remaining: 337,
      usage: {
        average_duration_ms: 120,
        today: { total_tokens: 1000, requests: 2, cost: 999 },
        total: { total_tokens: 4_300_000_000 }
      },
      subscription: {
        daily_limit_usd: 600,
        daily_usage_usd: 162,
        expires_at: '2026-08-21T00:00:00.000Z'
      }
    }),
    beta: makeUsageResponse({
      remaining: 337,
      usage: {
        average_duration_ms: 160,
        today: { total_tokens: 2400, requests: 5, cost: 999 },
        total: { total_tokens: 1_800_000_000 }
      },
      subscription: {
        daily_limit_usd: 600,
        daily_usage_usd: 162,
        expires_at: '2026-08-21T00:00:00.000Z'
      }
    })
  }));

  const text = collectText(output).join(' ');

  assert.match(text, /\$337\.00/u);
  assert.match(text, /今日消耗 \$162\.00/u);
  assert.match(text, /上限 \$600\.00/u);
  assert.match(text, /累计用量 61\.00 亿/u);
  assert.match(text, /TOKENS 3\.4K 3,400/u);
  assert.match(text, /请求数 7/u);
  assert.doesNotMatch(text, /累计用量 43\.00 亿/u);
  assert.doesNotMatch(text, /上限 \$1200\.00/u);
});

test('large widget sums top models across unique keys', async () => {
  const output = await widget(makeCtx('systemLarge', {
    alpha: makeUsageResponse({
      model_stats: [
        { model: 'gpt-5.5', cost: 100 },
        { model: 'gpt-5.4', cost: 50 },
        { model: 'gpt-5.3-codex', cost: 10 }
      ]
    }),
    beta: makeUsageResponse({
      model_stats: [
        { model: 'gpt-5.5', cost: 100 },
        { model: 'gpt-5.4', cost: 50 },
        { model: 'gpt-5.3-codex', cost: 10 }
      ]
    }),
    gamma: makeUsageResponse({
      planName: 'Ciii Team',
      remaining: 377,
      model_stats: [
        { model: 'gpt-5.5', cost: 25 },
        { model: 'gpt-5.4', cost: 5 },
        { model: 'gpt-5.3-codex', cost: 1 }
      ],
      usage: {
        today: { total_tokens: 3000, requests: 6, cost: 50 },
        total: { total_tokens: 3000 }
      },
      subscription: {
        daily_limit_usd: 900,
        daily_usage_usd: 50,
        expires_at: '2026-09-15T00:00:00.000Z'
      }
    })
  }));

  const text = collectText(output).join(' ');

  assert.match(text, /消耗 Top 3 \(USD\)/u);
  assert.match(text, /gpt-5\.5/u);
  assert.match(text, /\$225/u);
  assert.match(text, /gpt-5\.4/u);
  assert.match(text, /\$105/u);
  assert.match(text, /codex/u);
  assert.match(text, /\$21/u);
});

test('preview html exists for side-by-side visual inspection', async () => {
  const html = await readFile(new URL('../docs/widget-preview.html', import.meta.url), 'utf8');

  assert.match(html, /Egern Widget Preview/u);
  assert.match(html, /systemSmall/u);
  assert.match(html, /systemMedium/u);
  assert.match(html, /systemLarge/u);
});
