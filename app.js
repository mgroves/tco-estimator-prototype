const USE_CASES = {
  json: { label: "JSON / Document", tools: ["MongoDB", "DynamoDB", "DocumentDB"] },
  sql: { label: "SQL / Relational", tools: ["Postgres", "SQL Server", "Oracle"] },
  cache: { label: "Cache", tools: ["Redis", "Aerospike", "GemFire"] },
  fts: { label: "Full-Text Search", tools: ["Elasticsearch", "Solr"] },
  vector: { label: "Vector Search", tools: ["Pinecone", "AlloyDB"] },
  mobile: { label: "Mobile / Edge", tools: ["Ditto", "SQLite"] },
  analytics: { label: "Analytics", tools: ["Databricks", "ClickHouse"] }
};

const BENCHMARKS = {
  couchbase: {
    label: "Couchbase",
    relativePerformance: 1,
    source: "Couchbase baseline",
    notes: "Baseline for consolidation estimate."
  },
  AlloyDB: {
    useCase: "vector",
    relativePerformance: 3794 / 2646,
    source: "VectorDBBench, LAION 100M x 768, 90% recall, best AlloyDB LAION config in attached deck",
    notes: "AlloyDB L.IDX.2-256k: 3,794 QPS. Couchbase SQ8: 2,646 QPS. This model does not force Couchbase to win every selected workload."
  },
  DocumentDB: {
    useCase: "json",
    relativePerformance: 10828.902 / 38335.65987,
    source: "CatW YCSB-B small-small-10 throughput",
    notes: "Couchbase: 38,335.7 ops/sec. AWS DocumentDB: 10,828.9 ops/sec."
  },
  DynamoDB: {
    useCase: "json",
    relativePerformance: 3286 / 38335.65987,
    source: "CatW YCSB-B small-small-10 throughput",
    notes: "Couchbase: 38,335.7 ops/sec. AWS DynamoDB: 3,286 ops/sec."
  },
  "Azure Cosmos DB": {
    useCase: "json",
    relativePerformance: 3294 / 38335.65987,
    source: "CatW YCSB-B small-small-10 throughput",
    notes: "Couchbase: 38,335.7 ops/sec. Azure Cosmos DB: 3,294 ops/sec."
  },
  Redis: {
    useCase: "cache",
    relativePerformance: 1.2,
    source: "Editable placeholder",
    notes: "Pure cache workloads may favor a specialized cache. Replace with benchmark data when available."
  },
  Oracle: {
    useCase: "sql",
    relativePerformance: 0.65,
    source: "Editable placeholder",
    notes: "Placeholder until SQL benchmark data is added."
  }
};

const TOOL_COST_DEFAULT_SOURCE = "Prototype default, not a quote";
const TOOL_COST_DEFAULT_DETAILS = "Directional annual estimate for enterprise licensing/subscription, infrastructure, and operating complexity. Replace with account-specific pricing, cloud bills, vendor quotes, or procurement data before customer use.";

function toolCost(licenseCostPerYear, infraCostPerYear, adminComplexity, source = TOOL_COST_DEFAULT_SOURCE, details = TOOL_COST_DEFAULT_DETAILS) {
  return { licenseCostPerYear, infraCostPerYear, adminComplexity, source, details };
}

const TOOL_COSTS = {
  MongoDB: toolCost(300000, 180000, 0.6),
  DynamoDB: toolCost(220000, 260000, 0.55),
  DocumentDB: toolCost(210000, 220000, 0.55),
  Postgres: toolCost(80000, 190000, 0.5, "Prototype default, open-source software plus managed/cloud operating cost", "License is set low because many Postgres deployments do not pay database license fees directly. Infrastructure and admin cost still matter."),
  "SQL Server": toolCost(420000, 240000, 0.75),
  Oracle: toolCost(900000, 300000, 0.9),
  Redis: toolCost(160000, 120000, 0.4),
  Aerospike: toolCost(260000, 180000, 0.45),
  GemFire: toolCost(350000, 180000, 0.6),
  Elasticsearch: toolCost(280000, 260000, 0.65),
  Solr: toolCost(90000, 230000, 0.65, "Prototype default, open-source software plus managed/cloud operating cost", "License is set lower than proprietary services, but infrastructure and search operations can still be material."),
  Pinecone: toolCost(360000, 120000, 0.45),
  AlloyDB: toolCost(180000, 280000, 0.55),
  Ditto: toolCost(240000, 120000, 0.5),
  SQLite: toolCost(0, 90000, 0.45, "Prototype default, embedded/open-source software plus application ownership cost", "SQLite has no database license fee in this model. The cost reflects application/device operations, sync work, and support burden."),
  Databricks: toolCost(700000, 500000, 0.85),
  ClickHouse: toolCost(260000, 320000, 0.65),
  Couchbase: {
    baseLicenseCostPerYear: 650000,
    infraCostPerYear: 350000,
    adminComplexity: 0.7,
    source: "Prototype default, not a quote",
    details: "Directional Couchbase annual estimate before account-specific discounting. Replace with sales-approved pricing for customer conversations."
  }
};


function inputMeta(label, value, min, max, step, tooltip, source, details) {
  return { label, value, min, max, step, tooltip, source, details };
}

function optionMeta(label, value, options, tooltip, source, details) {
  return { label, value, options, tooltip, source, details };
}

const INPUTS = {
  workload: {
    opsPerSecond: inputMeta("Ops/sec", 25000, 10000, 1000000, 500, "Sustained application operations per second across the selected workloads.", "Customer input or discovery estimate", "Use observed peak/sustained throughput when available. This model scales infrastructure sublinearly so it does not simply multiply cost by ops/sec."),
    dataSizeGb: inputMeta("Data size (GB)", 1000, 100, 5000, 5, "Total operational data size across the selected systems.", "Customer input or discovery estimate", "Use current plus near-term expected operational data. This affects infrastructure cost with a conservative sublinear exponent."),
    activeUsers: inputMeta("Active users", 20000, 100, 5000000, 1000, "Estimated active user population supported by the selected data stack.", "Customer input or discovery estimate", "Captured for sales context and future model versions. The current formula does not directly price per user."),
    regions: inputMeta("Regions", 2, 1, 8, 1, "Number of deployment regions. Pipeline and infrastructure costs rise as regions increase.", "Customer architecture input", "Pipeline cost is multiplied by region count because every additional region usually adds integration, observability, failover, and troubleshooting burden."),
    uptimeRequirement: optionMeta("Availability target", "99.99", ["99.9", "99.99", "99.999"], "Higher targets generally require more redundancy and operational rigor.", "Customer SLA/SLO target", "The model maps 99.9 to 0.9x, 99.99 to 1.0x, and 99.999 to 1.2x infrastructure pressure. Adjust if a more precise HA model is added.")
  },
  assumptions: {
    laborCostPerEngineerYear: inputMeta("Fully loaded engineer cost", 180000, 90000, 350000, 5000, "Annual cost of one engineer, including salary, benefits, overhead, and management cost.", "Editable enterprise finance assumption", "Default is intentionally fully loaded, not salary-only. Replace with customer finance guidance when known."),
    integrationEngineerCount: inputMeta("Integration engineer count", 2, 0, 12, 0.25, "Annual engineering capacity spent keeping cross-tool integrations healthy.", "Editable discovery assumption", "Covers recurring work for connectors, ETL/ELT jobs, schema drift, incident response, retries, and cross-system data quality issues."),
    adminEngineerCountPerTool: inputMeta("Admin engineer count per tool", 0.35, 0, 2, 0.05, "Estimated ongoing operational ownership required for each separate data tool.", "Editable operations assumption", "Represents fractional DBA/SRE/platform ownership per tool, not necessarily a full dedicated admin for each product."),
    pipelineCostPerYear: inputMeta("Pipeline cost per year", 75000, 0, 400000, 5000, "Annual cost to build, operate, monitor, and troubleshoot one integration path between systems.", "Editable integration cost assumption", "Applied once per extra selected tool and multiplied by regions. Set to zero if pipeline work is already captured in labor inputs."),
    downtimeCostPerHour: inputMeta("Downtime cost per hour", 25000, 0, 500000, 5000, "Used to estimate the cost of extra downtime exposure from tool sprawl.", "Editable customer/business impact assumption", "Useful when the customer can estimate lost revenue, SLA penalties, productivity loss, or support costs from outages or degraded service."),
    couchbaseMigrationCost: inputMeta("Couchbase migration cost", 250000, 0, 3000000, 25000, "One-time migration cost. Annual comparisons spread this over three years.", "Editable migration assumption", "Includes planning, app changes, data migration, testing, training, and rollout. The annual comparison amortizes this over three years."),
    couchbaseDiscountFactor: inputMeta("Couchbase discount factor", 1, 0.4, 1.4, 0.05, "Multiplies the Couchbase license estimate. 1.0 means no adjustment.", "Editable commercial assumption", "Use only when there is a sales-approved discount or premium scenario. 0.8 means a 20% reduction; 1.2 means a 20% increase.")
  },
  advanced: {
    complexityCostFactor: inputMeta("Complexity cost factor", 0.25, 0, 1, 0.05, "Soft cost for coordination overhead, duplicated monitoring, security reviews, and troubleshooting.", "Editable model assumption", "Multiplies tool count, average admin complexity, and engineer cost. Keep visible because it is intentionally directional."),
    performanceInfraWeight: inputMeta("Performance impact on infrastructure", 0.6, 0, 1, 0.05, "How strongly benchmark performance changes estimated infrastructure cost. 0 ignores benchmark performance; 1 applies it fully.", "Editable model assumption", "Only affects tools with matching benchmark data for the selected use case. Tools without matching data use neutral 1.0x performance."),
    couchbaseAdminEngineerCount: inputMeta("Couchbase admin engineer count", 0.65, 0, 3, 0.05, "Estimated ongoing Couchbase administration capacity after consolidation.", "Editable operations assumption", "Represents the retained Couchbase operational owner after consolidation, not total engineering staff."),
    annualDowntimeHoursAvoidedPerTool: inputMeta("Downtime hours avoided per extra tool", 1.5, 0, 24, 0.5, "Directional estimate of avoidable annual downtime exposure from reducing tool count.", "Editable risk assumption", "Applied to each extra selected tool beyond the first, then multiplied by downtime cost per hour. Set to zero if you do not want risk priced in.")
  }
};

const state = {
  selectedTools: { json: ["MongoDB"], cache: ["Redis"], sql: ["Oracle"] },
  workload: Object.fromEntries(Object.entries(INPUTS.workload).map(([key, input]) => [key, input.value])),
  assumptions: Object.fromEntries(Object.entries(INPUTS.assumptions).map(([key, input]) => [key, input.value])),
  advanced: Object.fromEntries(Object.entries(INPUTS.advanced).map(([key, input]) => [key, input.value])),
  results: {},
  sources: {}
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function compactMoney(value) {
  return money.format(value ?? 0);
}

function toolCostTooltip(tool) {
  const cost = TOOL_COSTS[tool];
  const benchmark = benchmarkSummary(tool);

  return [
    `Cost source: ${cost.source}`,
    `Cost details: ${cost.details}`,
    `License/subscription: ${compactMoney(cost.licenseCostPerYear ?? cost.baseLicenseCostPerYear)}/year`,
    `Infrastructure: ${compactMoney(cost.infraCostPerYear)}/year before workload scaling`,
    `Admin complexity: ${number.format(cost.adminComplexity)} on a 0 to 1 directional scale`,
    "",
    benchmark.tooltip
  ].join("\n");
}

function inputTooltip(input) {
  return [
    input.tooltip,
    `Source: ${input.source}`,
    `Details: ${input.details}`
  ].join("\n");
}

function inputSources() {
  return Object.fromEntries(Object.entries(INPUTS).map(([group, inputs]) => [
    group,
    Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, {
      label: input.label,
      source: input.source,
      details: input.details
    }]))
  ]));
}

function selectedToolSources() {
  return Object.fromEntries(selectedTools().map((tool) => {
    const cost = TOOL_COSTS[tool];
    const benchmark = BENCHMARKS[tool];

    return [tool, {
      cost: {
        source: cost.source,
        details: cost.details,
        licenseCostPerYear: cost.licenseCostPerYear,
        infraCostPerYear: cost.infraCostPerYear,
        adminComplexity: cost.adminComplexity
      },
      benchmark: benchmark ? {
        relativePerformance: benchmark.relativePerformance,
        source: benchmark.source,
        notes: benchmark.notes
      } : {
        relativePerformance: 1,
        source: "No matching benchmark loaded",
        notes: "Neutral 1.0x performance factor used until matching data is added."
      }
    }];
  }));
}

function syncStateSources() {
  state.sources = {
    toolCosts: selectedToolSources(),
    couchbaseCost: {
      source: TOOL_COSTS.Couchbase.source,
      details: TOOL_COSTS.Couchbase.details,
      baseLicenseCostPerYear: TOOL_COSTS.Couchbase.baseLicenseCostPerYear,
      infraCostPerYear: TOOL_COSTS.Couchbase.infraCostPerYear,
      adminComplexity: TOOL_COSTS.Couchbase.adminComplexity
    },
    inputs: inputSources(),
    formulas: {
      workloadMultiplier: "ops^0.25 * data^0.2 * regional factor * uptime factor, floored at 0.35",
      currentAnnualCost: "selected tool license + scaled infrastructure + admin labor + integration labor + pipeline cost + complexity cost + downtime risk cost",
      couchbaseAnnualCost: "Couchbase license + scaled infrastructure + admin labor + three-year amortized migration cost",
      performanceInfraMultiplier: "1 / relative performance, softened by the Performance impact on infrastructure slider and capped between 0.55x and 8x"
    }
  };
}

function benchmarkSummary(tool) {
  const benchmark = BENCHMARKS[tool];

  if (!benchmark) {
    return {
      label: "Benchmark factor: none loaded",
      tooltip: [
        "Performance match: none loaded for this use case",
        "Source: editable placeholder",
        "Notes: This tool uses a neutral 1.0x performance factor until matching benchmark data is added."
      ].join("\n")
    };
  }

  return {
    label: `Benchmark factor: ${number.format(benchmark.relativePerformance)}x`,
    tooltip: [
      `Performance match: ${benchmark.label ?? tool} at ${number.format(benchmark.relativePerformance)}x Couchbase for the matched workload`,
      `Source: ${benchmark.source}`,
      `Notes: ${benchmark.notes}`
    ].join("\n")
  };
}

function selectedTools() {
  return Object.values(state.selectedTools).flat();
}

function selectedUseCaseCount() {
  return Object.values(state.selectedTools).filter((tools) => tools.length > 0).length;
}

function workloadMultiplier() {
  const ops = Math.pow(state.workload.opsPerSecond / 5000, 0.25);
  const data = Math.pow(state.workload.dataSizeGb / 10000, 0.2);
  const regions = 0.55 + state.workload.regions * 0.45;
  const uptime = { "99.9": 0.9, "99.99": 1, "99.999": 1.2 }[state.workload.uptimeRequirement];
  return Math.max(0.35, ops * data * regions * uptime);
}

function performanceInfraMultiplier(tool) {
  const perf = BENCHMARKS[tool]?.relativePerformance ?? 1;
  const fullMultiplier = 1 / Math.max(0.08, perf);
  const weighted = 1 + (fullMultiplier - 1) * state.advanced.performanceInfraWeight;
  return Math.min(8, Math.max(0.55, weighted));
}

function calculate() {
  const tools = selectedTools();
  const toolCount = tools.length;
  const pipelineCount = Math.max(0, toolCount - 1);
  const avgComplexity = toolCount
    ? tools.reduce((sum, tool) => sum + TOOL_COSTS[tool].adminComplexity, 0) / toolCount
    : 0;

  const scale = workloadMultiplier();
  const currentLicenseCost = tools.reduce((sum, tool) => sum + TOOL_COSTS[tool].licenseCostPerYear, 0);
  const currentInfraCost = tools.reduce((sum, tool) => {
    return sum + TOOL_COSTS[tool].infraCostPerYear * scale * performanceInfraMultiplier(tool);
  }, 0);

  const adminLaborCost = toolCount * state.assumptions.adminEngineerCountPerTool * state.assumptions.laborCostPerEngineerYear;
  const integrationLaborCost = pipelineCount > 0
    ? state.assumptions.integrationEngineerCount * state.assumptions.laborCostPerEngineerYear
    : 0;
  const pipelineCost = pipelineCount * state.assumptions.pipelineCostPerYear * state.workload.regions;
  const complexityCost = toolCount * avgComplexity * state.assumptions.laborCostPerEngineerYear * state.advanced.complexityCostFactor;
  const downtimeRiskCost = pipelineCount * state.advanced.annualDowntimeHoursAvoidedPerTool * state.assumptions.downtimeCostPerHour;

  const currentAnnualCost = currentLicenseCost + currentInfraCost + adminLaborCost + integrationLaborCost + pipelineCost + complexityCost + downtimeRiskCost;

  const couchbase = TOOL_COSTS.Couchbase;
  const useCases = selectedUseCaseCount();
  const useCaseLicenseFactor = toolCount === 0 ? 0 : 0.72 + Math.max(0, useCases - 1) * 0.16;
  const couchbaseLicenseCost = couchbase.baseLicenseCostPerYear * useCaseLicenseFactor * state.assumptions.couchbaseDiscountFactor;
  const couchbaseInfraCost = toolCount === 0 ? 0 : couchbase.infraCostPerYear * scale;
  const couchbaseAdminLaborCost = toolCount === 0 ? 0 : state.advanced.couchbaseAdminEngineerCount * state.assumptions.laborCostPerEngineerYear;
  const amortizedMigrationCost = toolCount === 0 ? 0 : state.assumptions.couchbaseMigrationCost / 3;
  const couchbaseAnnualCost = couchbaseLicenseCost + couchbaseInfraCost + couchbaseAdminLaborCost + amortizedMigrationCost;

  const annualSavings = currentAnnualCost - couchbaseAnnualCost;
  const savingsPercent = currentAnnualCost > 0 ? annualSavings / currentAnnualCost : 0;
  const annualSavingsBeforeMigration = currentAnnualCost - (couchbaseAnnualCost - amortizedMigrationCost);
  const paybackMonths = annualSavingsBeforeMigration > 0
    ? (state.assumptions.couchbaseMigrationCost / annualSavingsBeforeMigration) * 12
    : null;

  const currentComplexity = toolCount * avgComplexity;
  const couchbaseComplexity = toolCount === 0 ? 0 : couchbase.adminComplexity;
  const complexityReduction = currentComplexity > 0
    ? Math.max(0, 1 - couchbaseComplexity / currentComplexity)
    : 0;

  state.results = {
    currentAnnualCost,
    couchbaseAnnualCost,
    annualSavings,
    savingsPercent,
    paybackMonths,
    complexityReduction,
    selectedToolCount: toolCount,
    pipelineCount,
    currentLicenseCost,
    currentInfraCost,
    adminLaborCost,
    integrationLaborCost,
    pipelineCost,
    complexityCost,
    downtimeRiskCost,
    couchbaseLicenseCost,
    couchbaseInfraCost,
    couchbaseAdminLaborCost,
    amortizedMigrationCost
  };
}

function renderTools() {
  const container = $("toolGroups");
  container.innerHTML = Object.entries(USE_CASES).map(([useCase, group]) => `
    <section class="tool-group">
      <h3>${group.label}</h3>
      <div class="check-grid">
        ${group.tools.map((tool) => {
          const checked = state.selectedTools[useCase]?.includes(tool) ? "checked" : "";
          const benchmark = benchmarkSummary(tool);
          const cost = TOOL_COSTS[tool];

          return `
            <label class="check-card" title="${escapeHtml(toolCostTooltip(tool))}">
              <input type="checkbox" data-use-case="${useCase}" value="${tool}" ${checked} />
              <span>
                ${tool}<small>${escapeHtml(benchmark.label)}</small>
                <small>Cost: ${compactMoney(cost.licenseCostPerYear + cost.infraCostPerYear)}/yr base</small>
              </span>
            </label>
          `;
        }).join("")}
      </div>
    </section>
  `).join("");

  container.querySelectorAll("input[type='checkbox']").forEach((box) => {
    box.addEventListener("change", () => {
      const useCase = box.dataset.useCase;
      const current = new Set(state.selectedTools[useCase] ?? []);
      box.checked ? current.add(box.value) : current.delete(box.value);
      state.selectedTools[useCase] = [...current];
      update();
    });
  });
}

function renderInputGroup(containerId, groupName) {
  const container = $(containerId);
  container.innerHTML = Object.entries(INPUTS[groupName]).map(([key, input]) => {
    const value = state[groupName][key];
    const tip = inputTooltip(input);
    const safeTip = escapeHtml(tip);
    const control = input.options
      ? `<select id="${key}" title="${safeTip}">${input.options.map((option) => `<option value="${option}" ${option === value ? "selected" : ""}>${option}%</option>`).join("")}</select>`
      : `<input id="${key}Range" type="range" min="${input.min}" max="${input.max}" step="${input.step}" value="${value}" title="${safeTip}" />
         <input id="${key}" type="number" min="${input.min}" max="${input.max}" step="${input.step}" value="${value}" title="${safeTip}" />`;

    return `
      <div class="field" title="${safeTip}">
        <div>
          <label for="${key}">${input.label} <span class="info-dot" aria-label="source details">ⓘ</span></label>
          <p>${input.tooltip}</p>
          <small class="source-line">Source: ${escapeHtml(input.source)}</small>
        </div>
        <div class="field-controls">${control}</div>
      </div>
    `;
  }).join("");

  Object.keys(INPUTS[groupName]).forEach((key) => {
    const numberInput = $(key);
    const rangeInput = $(`${key}Range`);

    numberInput.addEventListener("input", () => {
      const input = INPUTS[groupName][key];
      state[groupName][key] = input.options ? numberInput.value : Number(numberInput.value);
      if (rangeInput) rangeInput.value = numberInput.value;
      update();
    });

    if (rangeInput) {
      rangeInput.addEventListener("input", () => {
        numberInput.value = rangeInput.value;
        state[groupName][key] = Number(rangeInput.value);
        update();
      });
    }
  });
}

function renderBenchmarkNotes() {
  const tools = selectedTools();
  const notes = tools
    .map((tool) => ({ tool, benchmark: BENCHMARKS[tool] }))
    .filter((item) => item.benchmark);

  $("benchmarkNotes").innerHTML = notes.length
    ? notes.map(({ tool, benchmark }) => `<li><strong>${tool}</strong>: ${benchmark.notes} <em>${benchmark.source}</em></li>`).join("")
    : `<li>No selected tool has matching benchmark data loaded yet. Those tools use a neutral 1.0x performance factor and still calculate from editable cost assumptions.</li>`;
}

function renderResults() {
  const r = state.results;
  $("annualSavings").textContent = money.format(r.annualSavings || 0);
  $("currentAnnualCost").textContent = money.format(r.currentAnnualCost || 0);
  $("couchbaseAnnualCost").textContent = money.format(r.couchbaseAnnualCost || 0);
  $("paybackMonths").textContent = r.paybackMonths === null ? "N/A" : `${number.format(r.paybackMonths)} months`;
  $("complexityReduction").textContent = percent.format(r.complexityReduction || 0);
  $("selectedToolCount").textContent = String(r.selectedToolCount || 0);

  $("annualSavings").closest(".result-card").title = "Current annual cost minus estimated Couchbase annual cost. Source details are in State JSON > sources.";
  $("currentAnnualCost").closest(".result-card").title = "License + benchmark-adjusted infrastructure + admin labor + integration labor + pipeline cost + complexity cost + downtime risk cost.";
  $("couchbaseAnnualCost").closest(".result-card").title = "Couchbase license estimate + scaled infrastructure + admin labor + migration cost amortized over three years.";
  $("paybackMonths").closest(".result-card").title = "One-time migration cost divided by annual savings before amortized migration cost, converted to months.";
  $("complexityReduction").closest(".result-card").title = "Directional comparison of selected tool complexity vs. Couchbase admin complexity.";
  $("selectedToolCount").closest(".result-card").title = "Count of selected point tools being modeled for consolidation.";

  const tools = selectedTools();
  $("selectedToolsSummary").textContent = tools.length ? tools.join(" + ") : "None selected yet.";

  const message = $("message");
  message.classList.toggle("warning", r.annualSavings < 0);
  message.textContent = r.annualSavings < 0
    ? "At this scale and tool mix, consolidation may not reduce cost. Couchbase is usually more compelling when multiple workloads, higher scale, or operational complexity are present."
    : "Estimated savings are positive under the selected assumptions. Adjust assumptions to match the account before using this in a conversation.";

  renderBenchmarkNotes();
  $("stateJson").textContent = JSON.stringify(state, null, 2);
}

function update() {
  calculate();
  syncStateSources();
  renderResults();
}

function init() {
  renderTools();
  renderInputGroup("workloadInputs", "workload");
  renderInputGroup("assumptionInputs", "assumptions");
  renderInputGroup("advancedInputs", "advanced");
  update();

  $("copyState").addEventListener("click", async () => {
    await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    $("copyStatus").textContent = "Copied";
    setTimeout(() => $("copyStatus").textContent = "", 1400);
  });
}

init();
