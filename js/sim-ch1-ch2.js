/* ==========================================================================
   《集成工艺化学》交互仿真引擎 — 工具库 + 第一章(4例) & 第二章(5例)
   ========================================================================== */

(function () {
  const ICChem = (window.ICChem = window.ICChem || { sims: {}, chapters: [] });

  ICChem.registerSim = function (caseId, factory) {
    ICChem.sims[caseId] = factory;
  };

  /* -------------------- 通用高分屏 Canvas 与控件构建工具 -------------------- */
  ICChem.ui = {
    createCanvas(viewport, heightPx = 410) {
      viewport.innerHTML = "";
      const canvas = document.createElement("canvas");
      canvas.style.height = heightPx + "px";
      viewport.appendChild(canvas);

      const resize = () => {
        const rect = viewport.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(320, rect.width || 720);
        const h = heightPx;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        const ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { ctx, w, h };
      };

      return { canvas, resize };
    },

    renderReadouts(container, items) {
      container.innerHTML = items
        .map(
          (it) => `
        <div class="readout-card">
          <span class="readout-label">${it.label}</span>
          <span class="readout-value ${it.tone || ""}">${it.value}<span class="readout-unit">${it.unit || ""}</span></span>
        </div>`
        )
        .join("");
    },

    slider({ label, min, max, step, value, unit = "", onInput, fullSpan = false }) {
      const wrap = document.createElement("div");
      wrap.className = "control-item" + (fullSpan ? " full-span" : "");
      wrap.innerHTML = `
        <div class="control-header">
          <span class="control-name">${label}</span>
          <span class="control-val-badge">${value}${unit}</span>
        </div>
        <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" />
      `;
      const input = wrap.querySelector("input");
      const badge = wrap.querySelector(".control-val-badge");
      input.addEventListener("input", () => {
        const v = Number(input.value);
        badge.textContent = `${v}${unit}`;
        onInput(v, badge, input);
      });
      return { el: wrap, input, setValue: (v) => { input.value = v; badge.textContent = `${v}${unit}`; } };
    },

    buttonGroup({ label, options, activeValue, onChange, fullSpan = false }) {
      const wrap = document.createElement("div");
      wrap.className = "control-item" + (fullSpan ? " full-span" : "");
      wrap.innerHTML = `<div class="control-header"><span class="control-name">${label}</span></div><div class="control-btn-group"></div>`;
      const grp = wrap.querySelector(".control-btn-group");
      const renderBtns = (curr) => {
        grp.innerHTML = "";
        options.forEach((opt) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "chip-btn" + (opt.value === curr ? " active" : "");
          btn.textContent = opt.label;
          btn.addEventListener("click", () => {
            renderBtns(opt.value);
            onChange(opt.value);
          });
          grp.appendChild(btn);
        });
      };
      renderBtns(activeValue);
      return { el: wrap, setActive: renderBtns };
    },

    drawRoundRect(ctx, x, y, w, h, r = 8) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  };

  const R_GAS = 8.314; // J/(mol·K)

  /* ==========================================================================
     1.1 质量守恒、热力学第一定律与 CVD 反应热计算 (ch1-thermo)
     ========================================================================== */
  ICChem.registerSim("ch1-thermo", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    const reactions = {
      ox: {
        name: "晶圆干氧热氧化",
        eq: "Si(s) + O₂(g) → SiO₂(s)",
        dH0: -910.9, // kJ/mol
        dnGas: -1,
        step1Label: "Si(s) + 1/2 O₂(g) → SiO(g)",
        dH1: -100.4,
        step2Label: "SiO(g) + 1/2 O₂(g) → SiO₂(s)",
        dH2: -810.5
      },
      sih4: {
        name: "硅烷 LPCVD 多晶硅沉积",
        eq: "SiH₄(g) → Si(s) + 2H₂(g)",
        dH0: -34.3, // SiH4 ΔfH° = +34.3 kJ/mol -> decomposition ΔrH° = -34.3 kJ/mol
        dnGas: +1,
        step1Label: "SiH₄(g) → SiH₂(g) + H₂(g)",
        dH1: +209.0,
        step2Label: "SiH₂(g) → Si(s) + H₂(g)",
        dH2: -243.3
      },
      sihcl3: {
        name: "三氯氢硅氢还原硅外延",
        eq: "SiHCl₃(g) + H₂(g) → Si(s) + 3HCl(g)",
        dH0: +219.3, // 3*(-92.3) - (-496.2) = +219.3 kJ/mol (强吸热)
        dnGas: +1,
        step1Label: "SiHCl₃(g) → SiCl₂(g) + HCl(g)",
        dH1: +235.5,
        step2Label: "SiCl₂(g) + H₂(g) → Si(s) + 2HCl(g)",
        dH2: -16.2
      },
      wf6: {
        name: "六氟化钨 CVD 钨塞沉积",
        eq: "WF₆(g) + 3H₂(g) → W(s) + 6HF(g)",
        dH0: +88.7,
        dnGas: +2,
        step1Label: "WF₆(g) + H₂(g) → WF₄(g) + 2HF(g)",
        dH1: +112.0,
        step2Label: "WF₄(g) + 2H₂(g) → W(s) + 4HF(g)",
        dH2: -23.3
      }
    };

    let state = { rxnKey: "sihcl3", moles: 2.0, tempK: 1100 };
    const { resize } = ICChem.ui.createCanvas(viewport, 410);
    let animId = null;
    let tick = 0;

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "选择集成电路典型化学反应体系",
          activeValue: state.rxnKey,
          fullSpan: true,
          options: [
            { label: "三氯氢硅外延 (吸热)", value: "sihcl3" },
            { label: "晶圆干氧氧化 (强放热)", value: "ox" },
            { label: "硅烷热解 CVD", value: "sih4" },
            { label: "WF₆ 钨接触塞 CVD", value: "wf6" }
          ],
          onChange: (v) => { state.rxnKey = v; updateReadouts(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "反应进度 ξ (摩尔数)",
          min: 0.5, max: 5.0, step: 0.5, value: state.moles, unit: " mol",
          onInput: (v) => { state.moles = v; updateReadouts(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "恒压反应腔温度 T",
          min: 300, max: 1500, step: 50, value: state.tempK, unit: " K",
          onInput: (v) => { state.tempK = v; updateReadouts(); }
        }).el
      );
    }

    function calc() {
      const rxn = reactions[state.rxnKey];
      const Qp = rxn.dH0 * state.moles; // kJ
      const W = (-rxn.dnGas * R_GAS * state.tempK * state.moles) / 1000; // kJ
      const dU = Qp + W;
      return { rxn, Qp, W, dU };
    }

    function updateReadouts() {
      const { rxn, Qp, W, dU } = calc();
      headerMetricsEl.textContent = `化学计量方程：${rxn.eq}`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "恒压反应热 Qp = ΔH", value: (Qp >= 0 ? "+" : "") + Qp.toFixed(1), unit: "kJ", tone: Qp > 0 ? "warning" : "positive" },
        { label: "环境对体系体积功 W", value: (W >= 0 ? "+" : "") + W.toFixed(2), unit: "kJ" },
        { label: "热力学能变 ΔU = Qp+W", value: (dU >= 0 ? "+" : "") + dU.toFixed(1), unit: "kJ" },
        { label: "气体计量数变化 Δν(g)", value: (rxn.dnGas >= 0 ? "+" : "") + rxn.dnGas, unit: "mol/mol" }
      ]);
    }

    function render() {
      tick += 0.03;
      const { ctx, w, h } = resize();
      const { rxn, Qp, W, dU } = calc();

      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧：恒压反应腔活塞与热流模型
      const leftW = w * 0.46;
      ctx.strokeStyle = "rgba(148,163,184,0.35)";
      ctx.lineWidth = 2;
      const chX = 42, chY = 72, chW = leftW - 70, chH = 265;
      ICChem.ui.drawRoundRect(ctx, chX, chY, chW, chH, 10);
      ctx.stroke();

      // 活塞位置随 Δn_gas 动态微调
      const pistonOffset = Math.max(-28, Math.min(35, rxn.dnGas * state.moles * 6));
      const pistonY = chY + 58 - pistonOffset;
      ctx.fillStyle = "#334155";
      ctx.fillRect(chX + 4, pistonY, chW - 8, 14);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(chX + chW / 2 - 6, chY - 12, 12, pistonY - (chY - 12));

      // 晶圆基座加热器
      const waferY = chY + chH - 36;
      const glow = Qp > 0 ? "rgba(251, 146, 60, 0.35)" : "rgba(56, 189, 248, 0.28)";
      ctx.fillStyle = glow;
      ctx.fillRect(chX + 20, waferY - 8, chW - 40, 26);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(chX + 34, waferY, chW - 68, 7);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`硅晶圆基座 (${state.tempK} K)`, chX + chW / 2, waferY + 24);

      // 粒子在活塞与晶圆间运动
      const count = Math.min(28, Math.round(10 + state.moles * 3));
      for (let i = 0; i < count; i++) {
        const px = chX + 24 + ((Math.sin(tick * (1.1 + (i % 5) * 0.2) + i * 2.1) * 0.5 + 0.5) * (chW - 48));
        const py = pistonY + 26 + ((Math.cos(tick * (0.9 + (i % 4) * 0.25) + i * 1.7) * 0.5 + 0.5) * (waferY - pistonY - 40));
        ctx.beginPath();
        ctx.arc(px, py, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? "#38bdf8" : "#2dd4bf";
        ctx.fill();
      }

      // 热流箭头提示
      const isEndo = Qp > 0;
      ctx.fillStyle = isEndo ? "#fbbf24" : "#fb7185";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(
        isEndo ? `🔥 吸热反应：环境向体系供热 Qp = +${Qp.toFixed(1)} kJ` : `⚡ 放热反应：体系向环境放热 Qp = ${Qp.toFixed(1)} kJ`,
        chX + chW / 2,
        42
      );
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px sans-serif";
      ctx.fillText(
        W < 0 ? `气体膨胀对外做功 (W = ${W.toFixed(2)} kJ)` : W > 0 ? `气体体积缩小环境做功 (W = +${W.toFixed(2)} kJ)` : "气体摩尔数不变 (W = 0)",
        chX + chW / 2,
        chY + chH + 26
      );

      // 右侧：盖斯定律分步与一步总焓变能级图
      const rxX = leftW + 18;
      const rxW = w - rxX - 28;
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ICChem.ui.drawRoundRect(ctx, rxX, 32, rxW, h - 58, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("盖斯定律 (Hess's Law) 焓变途径守恒图 (标准摩尔 kJ/mol)", rxX + 16, 58);

      // 三个状态能级：始态 E0 = 0, 中间态 E1 = dH1, 终态 E2 = dH0
      const vals = [0, rxn.dH1, rxn.dH0];
      const minV = Math.min(...vals) - 90;
      const maxV = Math.max(...vals) + 90;
      const mapY = (v) => 315 - ((v - minV) / (maxV - minV)) * 215;

      const yStart = mapY(0);
      const yMid = mapY(rxn.dH1);
      const yEnd = mapY(rxn.dH0);

      const x1 = rxX + 35, x2 = rxX + rxW * 0.48, x3 = rxX + rxW - 115;
      const platW = 88;

      const drawLevel = (x, y, color, title, valTxt) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + platW, y);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(title, x + platW / 2, y - 10);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px sans-serif";
        ctx.fillText(valTxt, x + platW / 2, y + 16);
      };

      drawLevel(x1, yStart, "#38bdf8", "始态 (反应物)", "H = 0 基准");
      drawLevel(x2 - 20, yMid, "#a78bfa", "中间态", rxn.step1Label.split("→")[1] || "中间体");
      drawLevel(x3, yEnd, "#34d399", "终态 (生成物)", `ΔrH° = ${rxn.dH0 > 0 ? "+" : ""}${rxn.dH0} kJ/mol`);

      // 绘制一步总途径虚线箭头与两步实线箭头
      const drawArrow = (fx, fy, tx, ty, color, label) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        const ang = Math.atan2(ty - fy, tx - fx);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - 9 * Math.cos(ang - 0.35), ty - 9 * Math.sin(ang - 0.35));
        ctx.lineTo(tx - 9 * Math.cos(ang + 0.35), ty - 9 * Math.sin(ang + 0.35));
        ctx.closePath();
        ctx.fill();

        ctx.font = "bold 11.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, (fx + tx) / 2, (fy + ty) / 2 - 8);
      };

      drawArrow(x1 + platW - 8, yStart, x2 - 12, yMid, "#a78bfa", `ΔH₁=${rxn.dH1 > 0 ? "+" : ""}${rxn.dH1}`);
      drawArrow(x2 + platW - 28, yMid, x3 + 8, yEnd, "#2dd4bf", `ΔH₂=${rxn.dH2 > 0 ? "+" : ""}${rxn.dH2}`);

      ctx.setLineDash([6, 4]);
      drawArrow(x1 + platW / 2, yStart + (yEnd > yStart ? 6 : -6), x3 + platW / 2, yEnd, "#fbbf24", `一步总变 ΔH = ΔH₁ + ΔH₂ = ${rxn.dH0}`);
      ctx.setLineDash([]);

      // 底部能量验证公式
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`第一定律核验：ΔU (${dU.toFixed(1)} kJ) = Qp (${Qp.toFixed(1)} kJ) + W (${W.toFixed(2)} kJ)`, rxX + 18, h - 42);

      animId = requestAnimationFrame(render);
    }

    buildControls();
    updateReadouts();
    render();

    return {
      reset() {
        state = { rxnKey: "sihcl3", moles: 2.0, tempK: 1100 };
        buildControls();
        updateReadouts();
      },
      destroy() {
        if (animId) cancelAnimationFrame(animId);
      }
    };
  });

  /* ==========================================================================
     1.2 反应自发性、熵与吉布斯自由能判据 ΔG = ΔH - TΔS (ch1-gibbs)
     ========================================================================== */
  ICChem.registerSim("ch1-gibbs", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    const presets = {
      sih4: { label: "CVD硅烷分解 (ΔH>0, ΔS>0 高温自发)", dH: 120, dS: 145 },
      ox: { label: "硅热氧化 Si+O₂→SiO₂ (ΔH<0, ΔS<0 低温/中温自发)", dH: -910.9, dS: -182.4 },
      exoEnt: { label: "臭氧分解 2O₃→3O₂ (ΔH<0, ΔS>0 全温区自发)", dH: -285, dS: 137 },
      nonSpont: { label: "金氧化 2Au+1.5O₂→Au₂O₃ (ΔH>0, ΔS<0 永不自发)", dH: 80, dS: -130 }
    };

    let state = { dH: 120, dS: 145, T: 1050 };
    const { resize } = ICChem.ui.createCanvas(viewport, 410);
    let animId = null;
    let tPhase = 0;

    let slDH, slDS, slT;

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "选择四种典型热力学象限反应预设",
          activeValue: "sih4",
          fullSpan: true,
          options: Object.entries(presets).map(([k, v]) => ({ label: v.label, value: k })),
          onChange: (k) => {
            const p = presets[k];
            state.dH = p.dH;
            state.dS = p.dS;
            slDH.setValue(state.dH);
            slDS.setValue(state.dS);
            updateReadouts();
          }
        }).el
      );
      slDH = ICChem.ui.slider({
        label: "标准焓变 ΔH°", min: -950, max: 500, step: 10, value: state.dH, unit: " kJ/mol",
        onInput: (v) => { state.dH = v; updateReadouts(); }
      });
      slDS = ICChem.ui.slider({
        label: "标准熵变 ΔS°", min: -250, max: 250, step: 5, value: state.dS, unit: " J/(mol·K)",
        onInput: (v) => { state.dS = v; updateReadouts(); }
      });
      slT = ICChem.ui.slider({
        label: "工艺温度 T", min: 200, max: 2000, step: 25, value: state.T, unit: " K", fullSpan: true,
        onInput: (v) => { state.T = v; updateReadouts(); }
      });
      controlsEl.appendChild(slDH.el);
      controlsEl.appendChild(slDS.el);
      controlsEl.appendChild(slT.el);
    }

    function calc() {
      const dG = state.dH - (state.T * state.dS) / 1000; // kJ/mol
      let teq = null;
      if (state.dS !== 0 && state.dH * state.dS > 0) {
        teq = (state.dH * 1000) / state.dS;
      }
      let quadrant = "";
      if (state.dH < 0 && state.dS > 0) quadrant = "焓减熵增：任何温度下正向自发";
      else if (state.dH > 0 && state.dS < 0) quadrant = "焓增熵减：任何温度下均非自发";
      else if (state.dH > 0 && state.dS > 0) quadrant = "熵驱动型：高温自发 (T > Teq)";
      else quadrant = "焓驱动型：低温自发 (T < Teq)";
      return { dG, teq, quadrant };
    }

    function updateReadouts() {
      const { dG, teq, quadrant } = calc();
      headerMetricsEl.textContent = quadrant;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "吉布斯自由能变 ΔG(T)", value: (dG >= 0 ? "+" : "") + dG.toFixed(1), unit: "kJ/mol", tone: dG < 0 ? "positive" : "danger" },
        { label: "熵判据项 −T·ΔS", value: ((-state.T * state.dS) / 1000).toFixed(1), unit: "kJ/mol" },
        { label: "转折平衡温度 Teq", value: teq && teq > 0 ? teq.toFixed(0) : "无正温交点", unit: teq && teq > 0 ? "K" : "" },
        { label: "反应自发性结论", value: dG < -0.5 ? "正向自发 ✓" : dG > 0.5 ? "正向非自发 ✕" : "处于相平衡", tone: dG < 0 ? "positive" : "danger" }
      ]);
    }

    function render() {
      tPhase += 0.035;
      const { ctx, w, h } = resize();
      const { dG, teq } = calc();

      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧绘制 ΔG - T 直线图 (Ellingham 风格)
      const gx = 64, gy = 38, gw = w * 0.62 - 80, gh = h - 88;
      ctx.fillStyle = "rgba(15,23,42,0.75)";
      ctx.fillRect(gx, gy, gw, gh);

      const dG200 = state.dH - (200 * state.dS) / 1000;
      const dG2000 = state.dH - (2000 * state.dS) / 1000;
      const maxAbs = Math.max(250, Math.abs(dG200), Math.abs(dG2000)) * 1.15;

      const mapX = (T) => gx + ((T - 200) / 1800) * gw;
      const mapY = (G) => gy + gh / 2 - (G / maxAbs) * (gh / 2);

      // ΔG < 0 绿色自发背景带
      ctx.fillStyle = "rgba(52, 211, 153, 0.08)";
      ctx.fillRect(gx, gy + gh / 2, gw, gh / 2);
      ctx.fillStyle = "rgba(251, 113, 133, 0.06)";
      ctx.fillRect(gx, gy, gw, gh / 2);

      // ΔG = 0 基准线
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(gx, mapY(0));
      ctx.lineTo(gx + gw, mapY(0));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#34d399";
      ctx.font = "11.5px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("ΔG < 0 正向自发区", gx + gw - 10, gy + gh - 12);
      ctx.fillStyle = "#fb7185";
      ctx.fillText("ΔG > 0 非自发区", gx + gw - 10, gy + 20);

      // ΔG(T) 曲线
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(mapX(200), mapY(dG200));
      ctx.lineTo(mapX(2000), mapY(dG2000));
      ctx.stroke();

      // 若存在 Teq 且在 200~2000K 内标出
      if (teq && teq >= 200 && teq <= 2000) {
        const tx = mapX(teq);
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(tx, mapY(0), 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "bold 11.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Teq = ${teq.toFixed(0)} K`, tx, mapY(0) - 12);
      }

      // 当前工作温度点
      const curX = mapX(state.T);
      const curY = mapY(dG);
      ctx.fillStyle = dG < 0 ? "#34d399" : "#fb7185";
      ctx.beginPath();
      ctx.arc(curX, curY, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 坐标轴刻度
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(gx, gy, gw, gh);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      [200, 600, 1000, 1400, 1800, 2000].forEach((tVal) => {
        ctx.fillText(`${tVal}K`, mapX(tVal), gy + gh + 18);
      });
      ctx.fillText("温度 T (K) →", gx + gw / 2, gy + gh + 36);
      ctx.textAlign = "right";
      ctx.fillText(`+${Math.round(maxAbs)}`, gx - 6, gy + 10);
      ctx.fillText("0", gx - 6, mapY(0) + 4);
      ctx.fillText(`-${Math.round(maxAbs)}`, gx - 6, gy + gh);

      // 右侧：微观混乱度（熵变 ΔS）可视化盒
      const bx = gx + gw + 28;
      const bw = w - bx - 24;
      ctx.fillStyle = "rgba(15,23,42,0.85)";
      ICChem.ui.drawRoundRect(ctx, bx, gy, bw, gh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.28)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("微观态混乱度与自发驱动力", bx + bw / 2, gy + 26);

      // 粒子运动幅度体现熵变 ΔS 与温度 T
      const boxTop = gy + 44, boxH = 155;
      ctx.strokeStyle = "rgba(148,163,184,0.3)";
      ctx.strokeRect(bx + 18, boxTop, bw - 36, boxH);

      const chaos = Math.max(0.08, (state.dS + 260) / 520) * (state.T / 1000);
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 5; c++) {
          const gridX = bx + 38 + (c * (bw - 76)) / 4;
          const gridY = boxTop + 28 + (r * (boxH - 56)) / 3;
          const idx = r * 5 + c;
          const jx = Math.sin(tPhase * (1.5 + (idx % 4) * 0.4) + idx) * 22 * Math.min(1.3, chaos);
          const jy = Math.cos(tPhase * (1.3 + (idx % 3) * 0.5) + idx * 1.7) * 18 * Math.min(1.3, chaos);
          ctx.beginPath();
          ctx.arc(gridX + jx, gridY + jy, 4.8, 0, Math.PI * 2);
          ctx.fillStyle = state.dS >= 0 ? "#2dd4bf" : "#818cf8";
          ctx.fill();
        }
      }

      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(state.dS >= 0 ? `熵增 ΔS = +${state.dS} J/(mol·K) (气态分子数增多)` : `熵减 ΔS = ${state.dS} J/(mol·K) (气相沉积为固相晶格)`, bx + bw / 2, boxTop + boxH + 22);

      // 底部大徽章展示正向/逆向趋势
      const pillY = boxTop + boxH + 42;
      ctx.fillStyle = dG < 0 ? "rgba(52, 211, 153, 0.18)" : "rgba(251, 113, 133, 0.18)";
      ICChem.ui.drawRoundRect(ctx, bx + 16, pillY, bw - 32, 62, 8);
      ctx.fill();
      ctx.fillStyle = dG < 0 ? "#34d399" : "#fb7185";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(dG < 0 ? "ΔG < 0：正向反应自发进行！" : "ΔG > 0：正向不能自发（逆向自发）", bx + bw / 2, pillY + 26);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11.5px sans-serif";
      ctx.fillText(`ΔG = ${state.dH} − (${state.T} × ${state.dS}/1000) = ${dG.toFixed(1)} kJ/mol`, bx + bw / 2, pillY + 47);

      animId = requestAnimationFrame(render);
    }

    buildControls();
    updateReadouts();
    render();

    return {
      reset() {
        state = { dH: 120, dS: 145, T: 1050 };
        buildControls();
        updateReadouts();
      },
      destroy() {
        if (animId) cancelAnimationFrame(animId);
      }
    };
  });

  /* ==========================================================================
     1.3 化学平衡常数与平衡移动动态仿真 (ch1-equil)
     SiCl4(g) + 2H2(g) ⇌ Si(s) + 4HCl(g)  (ΔH > 0)
     ========================================================================== */
  ICChem.registerSim("ch1-equil", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    let state = {
      tempK: 1350,
      pressureAtm: 1.0,
      feedH2: 2.2,
      feedSiCl4: 1.0,
      curHCl: 0.9
    };

    let history = [];
    const { resize } = ICChem.ui.createCanvas(viewport, 410);
    let animId = null;
    let waferThickness = 50; // arbitrary visual units (20..85)

    function getKeq(T) {
      // Endothermic reaction: ln K = -18000 / T + 13.6 -> at 1350K, K ≈ 1.31
      return Math.exp(-18000 / T + 13.6);
    }

    function getTargetEquilHCl() {
      const K = getKeq(state.tempK);
      // Q = (P_HCl^4) / (P_SiCl4 * P_H2^2) = x_HCl^4 * P / (x_SiCl4 * x_H2^2)
      // Solve approximate target curHCl so Q approaches K
      const denom = Math.max(0.05, state.feedSiCl4 * state.feedH2 * state.feedH2);
      const target = Math.pow((K * denom) / Math.max(0.1, state.pressureAtm), 0.25);
      return Math.min(3.5, Math.max(0.15, target));
    }

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "外延炉温度 T (吸热反应)", min: 1050, max: 1550, step: 25, value: state.tempK, unit: " K",
          onInput: (v) => { state.tempK = v; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "反应腔总压强 P (Δνg=+1)", min: 0.2, max: 4.0, step: 0.2, value: state.pressureAtm, unit: " atm",
          onInput: (v) => { state.pressureAtm = v; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "H₂ 反应物进气分压配比", min: 0.5, max: 4.0, step: 0.1, value: state.feedH2, unit: " 份",
          onInput: (v) => { state.feedH2 = v; }
        }).el
      );

      const pulseWrap = document.createElement("div");
      pulseWrap.className = "control-item";
      pulseWrap.innerHTML = `
        <div class="control-header"><span class="control-name">勒夏特列扰动测试</span></div>
        <div class="control-btn-group">
          <button type="button" class="chip-btn" id="btnPulseHCl">⚡ 注入 HCl 刻蚀脉冲</button>
          <button type="button" class="chip-btn" id="btnPurgeHCl">💨 抽排副产物 HCl</button>
        </div>
      `;
      pulseWrap.querySelector("#btnPulseHCl").addEventListener("click", () => {
        state.curHCl = Math.min(3.8, state.curHCl + 1.4);
      });
      pulseWrap.querySelector("#btnPurgeHCl").addEventListener("click", () => {
        state.curHCl = Math.max(0.12, state.curHCl * 0.35);
      });
      controlsEl.appendChild(pulseWrap);
    }

    function render() {
      const K = getKeq(state.tempK);
      const Q = (Math.pow(state.curHCl, 4) * state.pressureAtm) / Math.max(0.05, state.feedSiCl4 * state.feedH2 * state.feedH2);
      const targetHCl = getTargetEquilHCl();

      // 弛豫动力学演化
      const diff = targetHCl - state.curHCl;
      state.curHCl += diff * 0.025;
      waferThickness = Math.max(22, Math.min(82, waferThickness + diff * 0.35));

      history.push({ hcl: state.curHCl, eq: targetHCl });
      if (history.length > 220) history.shift();

      const shiftTxt = Math.abs(Q - K) / K < 0.06 ? "动态平衡 (v正 = v逆)" : Q < K ? "Q < K° → 正向移动 (外延沉积 Si)" : "Q > K° → 逆向移动 (HCl 气相刻蚀 Si)";
      headerMetricsEl.textContent = `SiCl₄(g) + 2H₂(g) ⇌ Si(s) + 4HCl(g) | ${shiftTxt}`;

      ICChem.ui.renderReadouts(readoutEl, [
        { label: "标准平衡常数 K°(T)", value: K.toFixed(3), unit: "" },
        { label: "瞬时反应商 Q", value: Q.toFixed(3), unit: "", tone: Q < K * 0.94 ? "positive" : Q > K * 1.06 ? "warning" : "" },
        { label: "气相 HCl 实时分压指标", value: state.curHCl.toFixed(2), unit: "相对值" },
        { label: "晶圆工艺状态", value: Q < K * 0.94 ? "外延生长中 ▲" : Q > K * 1.06 ? "原位反刻蚀 ▼" : "稳态平衡 ●", tone: Q < K * 0.94 ? "positive" : Q > K * 1.06 ? "danger" : "" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左半部分：弛豫时间曲线图
      const gx = 52, gy = 38, gw = w * 0.54 - 64, gh = h - 82;
      ctx.fillStyle = "rgba(15,23,42,0.8)";
      ctx.fillRect(gx, gy, gw, gh);
      ctx.strokeStyle = "#475569";
      ctx.strokeRect(gx, gy, gw, gh);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("平衡移动弛豫曲线：[HCl] 实时值 vs 新平衡态目标值", gx + 10, gy - 10);

      const mapY = (val) => gy + gh - (Math.min(3.8, val) / 3.8) * (gh - 20) - 10;

      // 目标平衡虚线
      ctx.strokeStyle = "#34d399";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      history.forEach((pt, idx) => {
        const x = gx + (idx / 220) * gw;
        const y = mapY(pt.eq);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // 实际浓度实线
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      history.forEach((pt, idx) => {
        const x = gx + (idx / 220) * gw;
        const y = mapY(pt.hcl);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px sans-serif";
      ctx.fillText("实线：瞬时 HCl 分压   虚线：当前 T/P 下平衡值", gx + 12, gy + gh + 20);

      // 右半部分：硅外延片生长 vs 刻蚀截面示意图
      const rx = gx + gw + 26, rw = w - rx - 24;
      ctx.fillStyle = "rgba(15,23,42,0.85)";
      ICChem.ui.drawRoundRect(ctx, rx, gy, rw, gh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("晶圆表面外延/气相刻蚀微观截面", rx + rw / 2, gy + 26);

      // 衬底与外延层
      const subBottom = gy + gh - 30;
      const subH = 44;
      ctx.fillStyle = "#1e3a5f";
      ctx.fillRect(rx + 26, subBottom - subH, rw - 52, subH);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11.5px sans-serif";
      ctx.fillText("单晶硅衬底 Si Substrate", rx + rw / 2, subBottom - 16);

      // 动态外延层厚度
      const epiH = waferThickness;
      ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
      ctx.fillRect(rx + 26, subBottom - subH - epiH, rw - 52, epiH);
      ctx.strokeStyle = "#38bdf8";
      ctx.strokeRect(rx + 26, subBottom - subH - epiH, rw - 52, epiH);
      ctx.fillStyle = "#f8fafc";
      ctx.fillText(`外延硅层厚度 ${(epiH * 0.08).toFixed(2)} μm`, rx + rw / 2, subBottom - subH - epiH / 2 + 4);

      // Q vs K 天平柱
      const barY = gy + 66;
      const qBar = Math.min(110, Math.log10(Math.max(0.01, Q)) * 28 + 55);
      const kBar = Math.min(110, Math.log10(Math.max(0.01, K)) * 28 + 55);

      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(rx + rw * 0.28 - 18, barY + (110 - qBar), 36, qBar);
      ctx.fillStyle = "#34d399";
      ctx.fillRect(rx + rw * 0.72 - 18, barY + (110 - kBar), 36, kBar);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(`Q = ${Q.toFixed(2)}`, rx + rw * 0.28, barY + 126);
      ctx.fillText(`K° = ${K.toFixed(2)}`, rx + rw * 0.72, barY + 126);

      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = Q < K * 0.94 ? "#34d399" : Q > K * 1.06 ? "#fb7185" : "#38bdf8";
      ctx.fillText(Q < K * 0.94 ? "<" : Q > K * 1.06 ? ">" : "=", rx + rw * 0.5, barY + 75);

      animId = requestAnimationFrame(render);
    }

    buildControls();
    render();

    return {
      reset() {
        state = { tempK: 1350, pressureAtm: 1.0, feedH2: 2.2, feedSiCl4: 1.0, curHCl: 0.9 };
        waferThickness = 50;
        history = [];
        buildControls();
      },
      destroy() {
        if (animId) cancelAnimationFrame(animId);
      }
    };
  });

  /* ==========================================================================
     1.4 化学反应速率、活化能与阿伦尼乌斯定律 (ch1-kinetics)
     ========================================================================== */
  ICChem.registerSim("ch1-kinetics", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    let state = { tempK: 350, conc: 1.0, catalyzed: false, eaUncat: 68 };
    const { resize } = ICChem.ui.createCanvas(viewport, 410);
    let animId = null;

    // 碰撞粒子池
    const particles = Array.from({ length: 36 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.014,
      vy: (Math.random() - 0.5) * 0.014,
      flash: 0,
      type: i % 2
    }));

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "刻蚀/沉积反应温度 T", min: 280, max: 520, step: 10, value: state.tempK, unit: " K",
          onInput: (v) => { state.tempK = v; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "反应物浓度 [C]", min: 0.2, max: 2.5, step: 0.1, value: state.conc, unit: " mol/L",
          onInput: (v) => { state.conc = v; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "表面催化剂 (如贵金属 MACE / ALD 催化活性位)",
          activeValue: state.catalyzed ? "on" : "off",
          fullSpan: true,
          options: [
            { label: "无催化剂 (活化能 Ea = 68 kJ/mol)", value: "off" },
            { label: "加入催化剂 (降低能垒至 Ea' = 42 kJ/mol)", value: "on" }
          ],
          onChange: (v) => { state.catalyzed = v === "on"; }
        }).el
      );
    }

    function render() {
      const ea = state.catalyzed ? 42 : state.eaUncat; // kJ/mol
      // 归一化计算速率常数 k (令 350K 无催化为基准 1.00)
      const kBase350 = Math.exp((-68 * 1000) / (R_GAS * 350));
      const kCur = Math.exp((-ea * 1000) / (R_GAS * state.tempK)) / kBase350;
      const rate = kCur * state.conc * state.conc;
      const activeFrac = Math.exp((-ea * 1000) / (R_GAS * state.tempK));

      headerMetricsEl.textContent = `阿伦尼乌斯公式：k = A·exp(−Ea/RT) | 当前有效 Ea = ${ea} kJ/mol`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "反应活化能 Ea", value: ea, unit: "kJ/mol", tone: state.catalyzed ? "positive" : "" },
        { label: "相对速率常数 k / k₀", value: kCur < 100 ? kCur.toFixed(2) : kCur.toExponential(2), unit: "倍", tone: "positive" },
        { label: "总刻蚀反应速率 v", value: (rate * 12.5).toFixed(1), unit: "nm/min", tone: "warning" },
        { label: "高能活化分子指数项", value: activeFrac.toExponential(2), unit: "" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左上：势能面反应坐标曲线 (过渡态能垒)
      const p1x = 46, p1y = 34, p1w = w * 0.48 - 58, p1h = 185;
      ctx.fillStyle = "rgba(15,23,42,0.82)";
      ICChem.ui.drawRoundRect(ctx, p1x, p1y, p1w, p1h, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(148,163,184,0.28)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("过渡态势能垒曲线 (反应坐标)", p1x + 12, p1y + 20);

      const drawBarrier = (peakH, color, dashed) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        if (dashed) ctx.setLineDash([5, 4]);
        ctx.beginPath();
        const sy = p1y + 135;
        const ey = p1y + 158;
        ctx.moveTo(p1x + 18, sy);
        ctx.lineTo(p1x + p1w * 0.24, sy);
        ctx.bezierCurveTo(
          p1x + p1w * 0.42, sy,
          p1x + p1w * 0.42, sy - peakH,
          p1x + p1w * 0.52, sy - peakH
        );
        ctx.bezierCurveTo(
          p1x + p1w * 0.62, sy - peakH,
          p1x + p1w * 0.65, ey,
          p1x + p1w * 0.78, ey
        );
        ctx.lineTo(p1x + p1w - 16, ey);
        ctx.stroke();
        ctx.setLineDash([]);
      };

      drawBarrier(92, state.catalyzed ? "rgba(148,163,184,0.45)" : "#fb7185", state.catalyzed);
      if (state.catalyzed) {
        drawBarrier(54, "#34d399", false);
      }
      ctx.fillStyle = state.catalyzed ? "#34d399" : "#fb7185";
      ctx.font = "11.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`活化能 Ea = ${ea} kJ/mol`, p1x + p1w * 0.52, p1y + 38);

      // 右上：麦克斯韦-玻尔兹曼能量分布曲线
      const p2x = w * 0.5 + 8, p2y = 34, p2w = w * 0.5 - 32, p2h = 185;
      ctx.fillStyle = "rgba(15,23,42,0.82)";
      ICChem.ui.drawRoundRect(ctx, p2x, p2y, p2w, p2h, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(148,163,184,0.28)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("分子动能分布与 E ≥ Ea 活化分子分数", p2x + 12, p2y + 20);

      const baseLineY = p2y + p2h - 24;
      const eaXFrac = ea / 105; // position along energy axis
      const ktScale = state.tempK / 260;

      // 阴影填充 E >= Ea 区域
      ctx.fillStyle = "rgba(251, 191, 36, 0.35)";
      ctx.beginPath();
      const startI = Math.floor(eaXFrac * 100);
      ctx.moveTo(p2x + 18 + eaXFrac * (p2w - 36), baseLineY);
      for (let i = startI; i <= 100; i++) {
        const u = (i / 100) * 4.5;
        const f = (u / (ktScale * ktScale)) * Math.exp(-u / ktScale) * 240;
        const x = p2x + 18 + (i / 100) * (p2w - 36);
        const y = baseLineY - Math.min(125, f);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(p2x + p2w - 18, baseLineY);
      ctx.closePath();
      ctx.fill();

      // 分布主线
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const u = (i / 100) * 4.5;
        const f = (u / (ktScale * ktScale)) * Math.exp(-u / ktScale) * 240;
        const x = p2x + 18 + (i / 100) * (p2w - 36);
        const y = baseLineY - Math.min(125, f);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Ea 竖线
      const eaX = p2x + 18 + eaXFrac * (p2w - 36);
      ctx.strokeStyle = "#fbbf24";
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(eaX, p2y + 34);
      ctx.lineTo(eaX, baseLineY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("Ea 阈值", eaX + 4, p2y + 46);

      // 下方通栏：有效碰撞微观反应室
      const cbx = 46, cby = 234, cbw = w - 70, cbh = h - 252;
      ctx.fillStyle = "rgba(11, 20, 36, 0.92)";
      ICChem.ui.drawRoundRect(ctx, cbx, cby, cbw, cbh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
      ctx.stroke();

      const activeN = Math.max(8, Math.min(36, Math.round(state.conc * 15)));
      const speedMult = (state.tempK / 320) * 0.85;

      for (let i = 0; i < activeN; i++) {
        const p = particles[i];
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;
        if (p.x < 0.03 || p.x > 0.97) p.vx *= -1;
        if (p.y < 0.08 || p.y > 0.92) p.vy *= -1;
        if (p.flash > 0) p.flash -= 0.06;

        for (let j = i + 1; j < activeN; j++) {
          const q = particles[j];
          const dx = (p.x - q.x) * cbw;
          const dy = (p.y - q.y) * cbh;
          if (dx * dx + dy * dy < 140 && p.type !== q.type) {
            if (Math.random() < Math.min(0.85, kCur * 0.08)) {
              p.flash = 1;
              q.flash = 1;
            }
          }
        }

        const px = cbx + p.x * cbw;
        const py = cby + p.y * cbh;
        if (p.flash > 0.1) {
          ctx.beginPath();
          ctx.arc(px, py, 11 * p.flash + 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 191, 36, ${p.flash * 0.55})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 0 ? "#38bdf8" : "#2dd4bf";
        ctx.fill();
      }

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("微观分子碰撞腔（金色闪光 = 动能超越 Ea 的有效反应碰撞）", cbx + 14, cby + 20);

      animId = requestAnimationFrame(render);
    }

    buildControls();
    render();

    return {
      reset() {
        state = { tempK: 350, conc: 1.0, catalyzed: false, eaUncat: 68 };
        buildControls();
      },
      destroy() {
        if (animId) cancelAnimationFrame(animId);
      }
    };
  });

  /* ==========================================================================
     2.1 溶液浓度的五种表示方法与电子化学品配比换算 (ch2-conc)
     ========================================================================== */
  ICChem.registerSim("ch2-conc", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    const reagents = {
      tmah: { name: "TMAH 光刻显影液", formula: "(CH₃)₄NOH", M: 91.15, defaultW: 2.38, maxW: 25, baseRhoSlope: 0.0008, color: "#38bdf8" },
      hf: { name: "电子级氢氟酸", formula: "HF", M: 20.01, defaultW: 49.0, maxW: 50, baseRhoSlope: 0.0032, color: "#2dd4bf" },
      h2so4: { name: "UP-SSS 超纯硫酸", formula: "H₂SO₄", M: 98.08, defaultW: 96.0, maxW: 98, baseRhoSlope: 0.0085, color: "#fbbf24" },
      h2o2: { name: "电子级过氧化氢", formula: "H₂O₂", M: 34.01, defaultW: 30.0, maxW: 50, baseRhoSlope: 0.0037, color: "#818cf8" },
      nacl: { name: "氯化钠标准水溶液", formula: "NaCl", M: 58.44, defaultW: 5.0, maxW: 26, baseRhoSlope: 0.0071, color: "#34d399" }
    };

    let state = { key: "tmah", wPct: 2.38, tempC: 20 };
    const { resize } = ICChem.ui.createCanvas(viewport, 390);
    let slW;

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "选择集成电路湿电子化学品 / 标准试剂",
          activeValue: state.key,
          fullSpan: true,
          options: Object.entries(reagents).map(([k, r]) => ({ label: `${r.name} (${r.formula})`, value: k })),
          onChange: (k) => {
            state.key = k;
            state.wPct = reagents[k].defaultW;
            buildControls();
            draw();
          }
        }).el
      );
      const rg = reagents[state.key];
      slW = ICChem.ui.slider({
        label: "溶质质量分数 w", min: 0.5, max: rg.maxW, step: 0.01, value: state.wPct, unit: " %",
        onInput: (v) => { state.wPct = v; draw(); }
      });
      const slT = ICChem.ui.slider({
        label: "溶液温度 t (影响体积与密度)", min: 10, max: 60, step: 1, value: state.tempC, unit: " °C",
        onInput: (v) => { state.tempC = v; draw(); }
      });
      controlsEl.appendChild(slW.el);
      controlsEl.appendChild(slT.el);
    }

    function draw() {
      const rg = reagents[state.key];
      const wFrac = state.wPct / 100;
      const rho20 = 0.9982 + rg.baseRhoSlope * state.wPct;
      const rho = rho20 * (1 - 0.00032 * (state.tempC - 20)); // 热膨胀修正
      const c = (1000 * rho * wFrac) / rg.M; // mol/L
      const b = (1000 * wFrac) / (rg.M * Math.max(0.005, 1 - wFrac)); // mol/kg
      const nSolute = (100 * wFrac) / rg.M;
      const nWater = (100 * (1 - wFrac)) / 18.015;
      const xB = nSolute / (nSolute + nWater);

      headerMetricsEl.textContent = `${rg.name} (${rg.formula}, M = ${rg.M} g/mol) | ρ(${state.tempC}°C) = ${rho.toFixed(4)} g/mL`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "质量分数 w", value: state.wPct.toFixed(2), unit: "%" },
        { label: "物质的量浓度 c (随T微变)", value: c.toFixed(3), unit: "mol/L", tone: "positive" },
        { label: "质量摩尔浓度 b (与T无关)", value: b.toFixed(3), unit: "mol/kg" },
        { label: "溶质摩尔分数 xB", value: xB.toFixed(4), unit: "" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧绘制精细容量瓶与溶质粒子密度视觉图
      const fx = w * 0.23, fy = 55;
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2.5;
      // 瓶颈
      ctx.beginPath();
      ctx.moveTo(fx - 18, fy);
      ctx.lineTo(fx - 18, fy + 105);
      ctx.bezierCurveTo(fx - 85, fy + 150, fx - 92, fy + 265, fx - 52, fy + 285);
      ctx.lineTo(fx + 52, fy + 285);
      ctx.bezierCurveTo(fx + 92, fy + 265, fx + 85, fy + 150, fx + 18, fy + 105);
      ctx.lineTo(fx + 18, fy);
      ctx.stroke();

      // 液体填充与刻度线
      ctx.save();
      ctx.clip();
      const liqTop = fy + 66 - (state.tempC - 20) * 0.25; // 热胀液面略升
      ctx.fillStyle = rg.color + "38";
      ctx.fillRect(fx - 100, liqTop, 200, 300);

      // 溶质粒子示意点
      const dots = Math.min(140, Math.max(6, Math.round(c * 9)));
      ctx.fillStyle = rg.color;
      for (let i = 0; i < dots; i++) {
        const px = fx - 64 + ((i * 53) % 128);
        const py = fy + 125 + ((i * 37) % 148);
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 容量瓶标线
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx - 26, fy + 66);
      ctx.lineTo(fx + 26, fy + 66);
      ctx.stroke();
      ctx.fillStyle = "#fbbf24";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("1000 mL 标线 (20°C)", fx + 32, fy + 70);

      // 右侧绘制换算关系卡片矩阵
      const rx = w * 0.46, rw = w - rx - 32;
      const cards = [
        { title: "1 L 溶液中含溶质质量", val: `${(c * rg.M).toFixed(2)} g`, desc: `m(溶质) = c · V · M = 1000 · ρ · w` },
        { title: "1 kg 纯水溶剂所配溶质量", val: `${b.toFixed(3)} mol (${(b * rg.M).toFixed(1)} g)`, desc: `质量摩尔浓度 b 不随温度热胀冷缩改变` },
        { title: "配制 500 mL 0.100 mol/L 稀溶液需量取该原液", val: c >= 0.1 ? `${((0.5 * 0.1 * 1000) / c).toFixed(2)} mL` : "原液浓度低于目标值", desc: `稀释定律 c₁V₁ = c₂V₂` }
      ];

      cards.forEach((cd, idx) => {
        const cy = 48 + idx * 104;
        ctx.fillStyle = "rgba(15,23,42,0.88)";
        ICChem.ui.drawRoundRect(ctx, rx, cy, rw, 88, 9);
        ctx.fill();
        ctx.strokeStyle = "rgba(56,189,248,0.3)";
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px sans-serif";
        ctx.fillText(cd.title, rx + 16, cy + 25);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(cd.val, rx + 16, cy + 54);
        ctx.fillStyle = "#64748b";
        ctx.font = "11.5px sans-serif";
        ctx.fillText(cd.desc, rx + 16, cy + 75);
      });
    }

    buildControls();
    draw();

    return {
      reset() {
        state = { key: "tmah", wPct: 2.38, tempC: 20 };
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });

  /* ==========================================================================
     2.2 稀溶液的依数性与超纯水反渗透制备原理 (ch2-colligative)
     ========================================================================== */
  ICChem.registerSim("ch2-colligative", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    let state = { molality: 0.4, extPressKPa: 0 };
    const { resize } = ICChem.ui.createCanvas(viewport, 410);
    let animId = null;
    let tick = 0;

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "溶质质量摩尔浓度 b (难挥发非电解质)", min: 0.05, max: 1.5, step: 0.05, value: state.molality, unit: " mol/kg",
          onInput: (v) => { state.molality = v; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "浓溶液侧外加机械压力 P_ext (RO反渗透测试)", min: 0, max: 4500, step: 100, value: state.extPressKPa, unit: " kPa",
          onInput: (v) => { state.extPressKPa = v; }
        }).el
      );
    }

    function render() {
      tick += 0.04;
      const b = state.molality;
      // 水常数：Kb = 0.512 K·kg/mol, Kf = 1.86 K·kg/mol, 298K 饱和蒸气压 p* = 3.169 kPa
      const dTb = 0.512 * b;
      const dTf = 1.86 * b;
      const xB = b / (b + 55.51);
      const dp = 3.169 * xB;
      const piKPa = b * R_GAS * 298.15; // 稀溶液 c ≈ b

      const isRO = state.extPressKPa > piKPa;
      headerMetricsEl.textContent = isRO
        ? `P_ext (${state.extPressKPa} kPa) > Π (${piKPa.toFixed(0)} kPa) → 反渗透模式：产出 18.2 MΩ·cm 超纯水！`
        : `P_ext (${state.extPressKPa} kPa) < Π (${piKPa.toFixed(0)} kPa) → 正向自然渗透：水分子向浓溶液侧迁移`;

      ICChem.ui.renderReadouts(readoutEl, [
        { label: "25°C 蒸气压下降 Δp", value: (dp * 1000).toFixed(1), unit: "Pa" },
        { label: "沸点升高 Tb (标准100°C)", value: (100 + dTb).toFixed(3), unit: "°C", tone: "warning" },
        { label: "凝固点降低 Tf (标准0°C)", value: (-dTf).toFixed(3), unit: "°C", tone: "positive" },
        { label: "25°C 渗透压 Π = cRT", value: piKPa.toFixed(0), unit: "kPa", tone: isRO ? "positive" : "warning" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧：水溶液 p-T 相图依数性偏移
      const lx = 44, ly = 36, lw = w * 0.47 - 54, lh = h - 76;
      ctx.fillStyle = "rgba(15,23,42,0.84)";
      ICChem.ui.drawRoundRect(ctx, lx, ly, lw, lh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(148,163,184,0.28)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("水的 p–T 相图：蒸气压下降引发 ΔTf 与 ΔTb", lx + 12, ly + 22);

      // 1 atm 水平参考线
      const p1atmY = ly + 92;
      ctx.strokeStyle = "rgba(251,191,36,0.45)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(lx + 20, p1atmY);
      ctx.lineTo(lx + lw - 20, p1atmY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "11px sans-serif";
      ctx.fillText("101.3 kPa (1 atm)", lx + 24, p1atmY - 6);

      // 纯水气液线与固液线
      const tx0 = lx + lw * 0.34, ty0 = ly + lh * 0.62; // 三相点
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(tx0, ty0);
      ctx.quadraticCurveTo(lx + lw * 0.6, ty0 - 20, lx + lw * 0.78, ly + 56);
      ctx.stroke();
      // 固液线
      ctx.beginPath();
      ctx.moveTo(tx0, ty0);
      ctx.lineTo(tx0 - 16, ly + 56);
      ctx.stroke();

      // 稀溶液下移曲线（视觉放大比例便于教学观察）
      const shiftPx = Math.min(48, b * 28);
      ctx.strokeStyle = "#fb7185";
      ctx.lineWidth = 2.4;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(tx0 - shiftPx * 0.55, ty0 + shiftPx * 0.45);
      ctx.quadraticCurveTo(lx + lw * 0.6 + shiftPx * 0.3, ty0 - 20 + shiftPx, lx + lw * 0.78 + shiftPx * 0.65, ly + 56 + shiftPx * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx0 - shiftPx * 0.55, ty0 + shiftPx * 0.45);
      ctx.lineTo(tx0 - 16 - shiftPx * 0.65, ly + 56);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#38bdf8";
      ctx.fillText("实线：纯水溶剂", lx + 24, ly + lh - 34);
      ctx.fillStyle = "#fb7185";
      ctx.fillText(`虚线：稀溶液 (Tf左移 -${dTf.toFixed(2)}K, Tb右移 +${dTb.toFixed(2)}K)`, lx + 24, ly + lh - 15);

      // 右侧：U型半透膜渗透 / 超纯水反渗透装置
      const rx = w * 0.5 + 10, ry = 36, rw = w * 0.5 - 34, rh = h - 76;
      ctx.fillStyle = "rgba(15,23,42,0.84)";
      ICChem.ui.drawRoundRect(ctx, rx, ry, rw, rh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("半透膜渗透与晶圆厂超纯水反渗透 (RO) 池", rx + rw / 2, ry + 24);

      const tankX = rx + 34, tankY = ry + 64, tankW = rw - 68, tankH = rh - 102;
      const midX = tankX + tankW / 2;

      // 液位差根据 (piKPa - extPressKPa) 动态升降
      const netDrive = (piKPa - state.extPressKPa) / 2500;
      const deltaLevel = Math.max(-42, Math.min(42, netDrive * 32));

      // 左侧纯水区
      const leftTop = tankY + 62 + deltaLevel;
      ctx.fillStyle = "rgba(56, 189, 248, 0.28)";
      ctx.fillRect(tankX, leftTop, tankW / 2, tankY + tankH - leftTop);

      // 右侧浓溶液区
      const rightTop = tankY + 62 - deltaLevel;
      ctx.fillStyle = "rgba(45, 212, 191, 0.32)";
      ctx.fillRect(midX, rightTop, tankW / 2, tankY + tankH - rightTop);

      // 浓溶液侧加压活塞
      if (state.extPressKPa > 0) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(midX + 8, rightTop - 12, tankW / 2 - 16, 10);
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(`外压 P = ${state.extPressKPa} kPa ↓`, midX + tankW / 4, rightTop - 18);
      }

      // 溶质大粒子（无法穿过中央半透膜）
      const nDots = Math.min(24, Math.round(4 + b * 12));
      for (let i = 0; i < nDots; i++) {
        const px = midX + 16 + ((i * 29 + Math.sin(tick + i) * 5) % (tankW / 2 - 32));
        const py = rightTop + 18 + ((i * 31) % Math.max(24, tankY + tankH - rightTop - 28));
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "#fbbf24";
        ctx.fill();
      }

      // 水分子穿过半透膜净通量动画箭头
      const dir = isRO ? -1 : 1; // -1: 右向左(反渗透产纯水), +1: 左向右(自然渗透)
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.strokeRect(tankX, tankY, tankW, tankH);

      // 中央半透膜虚线
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(midX, tankY);
      ctx.lineTo(midX, tankY + tankH);
      ctx.stroke();
      ctx.setLineDash([]);

      // 净水流通量箭头
      ctx.fillStyle = isRO ? "#34d399" : "#38bdf8";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(isRO ? "◀◀ 水分子逆向滤出 (RO产超纯水)" : "水分子自发渗透 ▶▶", midX, tankY + tankH + 22);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px sans-serif";
      ctx.fillText("纯水侧 (UPW)", tankX + tankW / 4, tankY - 8);
      ctx.fillText("原水/浓溶液侧", midX + tankW / 4, tankY - 8);

      animId = requestAnimationFrame(render);
    }

    buildControls();
    render();

    return {
      reset() {
        state = { molality: 0.4, extPressKPa: 0 };
        buildControls();
      },
      destroy() {
        if (animId) cancelAnimationFrame(animId);
      }
    };
  });

  /* ==========================================================================
     2.3 酸碱质子理论与 BOE (HF/NH4F) 缓冲氧化物刻蚀液机理 (ch2-buffer)
     ========================================================================== */
  ICChem.registerSim("ch2-buffer", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    let state = { ratioNH4F: 6.0, cHF: 1.0, acidBaseDelta: 0.0 };
    const { resize } = ICChem.ui.createCanvas(viewport, 400);

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "BOE 共轭碱配比 [NH₄F] / [HF]", min: 0.5, max: 10.0, step: 0.5, value: state.ratioNH4F, unit: " : 1",
          onInput: (v) => { state.ratioNH4F = v; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "外加酸碱或反应消耗扰动 Δn (正=耗酸/加碱，负=加酸)", min: -0.45, max: 0.45, step: 0.05, value: state.acidBaseDelta, unit: " mol/L",
          onInput: (v) => { state.acidBaseDelta = v; draw(); }
        }).el
      );
    }

    function draw() {
      const pKa = 3.17; // HF pKa
      const cA = Math.max(0.05, state.cHF - state.acidBaseDelta);
      const cB = Math.max(0.05, state.cHF * state.ratioNH4F + state.acidBaseDelta);
      const pH_BOE = pKa + Math.log10(cB / cA);

      // 对比组：无缓冲纯稀 HF (初始同 pH 或 0.2 mol/L 纯 HF 遇扰动)
      let pH_unbuf;
      if (state.acidBaseDelta > 0.18) {
        pH_unbuf = 14 + Math.log10(state.acidBaseDelta - 0.18); // 酸被耗尽直接跳至强碱性！
      } else if (state.acidBaseDelta < -0.05) {
        pH_unbuf = -Math.log10(-state.acidBaseDelta + 0.015);
      } else {
        const remHF = Math.max(0.002, 0.2 - state.acidBaseDelta);
        pH_unbuf = 0.5 * (pKa - Math.log10(remHF));
      }
      pH_unbuf = Math.max(0.6, Math.min(12.8, pH_unbuf));

      // HF2- 刻蚀活性物种相对稳定度 (K2 ≈ 3.9 for HF + F- ⇌ HF2-)
      const hf2Rel = (3.9 * cA * cB) / (1 + 3.9 * cB);
      const etchRateNmMin = hf2Rel * 85; // 典型 6:1 BOE 约 80~100 nm/min 热氧化硅刻蚀速率

      headerMetricsEl.textContent = `共轭酸碱对 HF / F⁻ (pKa = 3.17) | 活性刻蚀离子 HF₂⁻ 稳态供给`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "BOE 缓冲液实时 pH", value: pH_BOE.toFixed(2), unit: "", tone: "positive" },
        { label: "无缓冲稀 HF 对比 pH", value: pH_unbuf.toFixed(2), unit: "", tone: Math.abs(pH_unbuf - 2.0) > 1.2 ? "danger" : "warning" },
        { label: "活性 [HF₂⁻] 有效指标", value: hf2Rel.toFixed(2), unit: "mol/L" },
        { label: "SiO₂ 稳态刻蚀速率", value: etchRateNmMin.toFixed(1), unit: "nm/min", tone: "positive" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧绘制随扰动 Δn 变化的 pH 抗冲击曲线对比（BOE vs 纯水/无缓冲HF）
      const gx = 54, gy = 38, gw = w * 0.53 - 66, gh = h - 78;
      ctx.fillStyle = "rgba(15,23,42,0.85)";
      ctx.fillRect(gx, gy, gw, gh);
      ctx.strokeStyle = "#475569";
      ctx.strokeRect(gx, gy, gw, gh);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("抗酸碱波动对比：BOE缓冲液 vs 无缓冲稀HF", gx + 10, gy - 10);

      const mapX = (d) => gx + ((d + 0.45) / 0.9) * gw;
      const mapY = (ph) => gy + gh - (ph / 13.5) * (gh - 20) - 10;

      // 无缓冲剧烈突变线
      ctx.strokeStyle = "#fb7185";
      ctx.lineWidth = 2.2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      for (let d = -0.45; d <= 0.451; d += 0.02) {
        let phu;
        if (d > 0.18) phu = 14 + Math.log10(d - 0.175);
        else if (d < -0.05) phu = -Math.log10(-d + 0.015);
        else phu = 0.5 * (pKa - Math.log10(Math.max(0.002, 0.2 - d)));
        phu = Math.max(0.6, Math.min(12.8, phu));
        const x = mapX(d), y = mapY(phu);
        if (d === -0.45) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // BOE 平坦缓冲线
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let d = -0.45; d <= 0.451; d += 0.02) {
        const ca = Math.max(0.05, state.cHF - d);
        const cb = Math.max(0.05, state.cHF * state.ratioNH4F + d);
        const phb = pKa + Math.log10(cb / ca);
        const x = mapX(d), y = mapY(phb);
        if (d === -0.45) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 当前工作点
      ctx.fillStyle = "#34d399";
      ctx.beginPath();
      ctx.arc(mapX(state.acidBaseDelta), mapY(pH_BOE), 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.arc(mapX(state.acidBaseDelta), mapY(pH_unbuf), 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px sans-serif";
      ctx.fillText("绿实线：BOE缓冲体系 (pH极稳)    红虚线：无缓冲稀HF (pH剧变)", gx + 10, gy + gh + 20);

      // 右侧：质子转移平衡粒子柱状分布 & 光刻胶下 SiO2 湿法刻蚀图
      const rx = gx + gw + 26, rw = w - rx - 24;
      ctx.fillStyle = "rgba(15,23,42,0.85)";
      ICChem.ui.drawRoundRect(ctx, rx, gy, rw, gh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("BOE 溶液中物种平衡分布与晶圆刻蚀保护", rx + rw / 2, gy + 26);

      const species = [
        { name: "共轭酸 HF", val: cA, color: "#38bdf8" },
        { name: "共轭碱 F⁻", val: cB, color: "#818cf8" },
        { name: "刻蚀主力 HF₂⁻", val: hf2Rel, color: "#34d399" }
      ];
      const maxS = Math.max(8, cB * 1.1);
      species.forEach((sp, i) => {
        const bx = rx + 32 + i * ((rw - 64) / 3) + 10;
        const barMaxH = 125;
        const bh = Math.max(6, (sp.val / maxS) * barMaxH);
        const by = gy + 180 - bh;
        ctx.fillStyle = sp.color;
        ctx.fillRect(bx, by, 42, bh);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 11.5px sans-serif";
        ctx.fillText(sp.val.toFixed(2), bx + 21, by - 6);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px sans-serif";
        ctx.fillText(sp.name, bx + 21, gy + 198);
      });

      // 底部文字解析框
      ctx.fillStyle = "rgba(56, 189, 248, 0.1)";
      ICChem.ui.drawRoundRect(ctx, rx + 16, gy + 216, rw - 32, gh - 232, 8);
      ctx.fill();
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "11.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("• 质子转移：HF(酸) + H₂O(碱) ⇌ F⁻(共轭碱) + H₃O⁺(共轭酸)", rx + 26, gy + 240);
      ctx.fillText("• 工艺意义：NH₄F 抑制光刻胶界面钻蚀脱胶，维持恒定刻蚀深度！", rx + 26, gy + 264);
    }

    buildControls();
    draw();

    return {
      reset() {
        state = { ratioNH4F: 6.0, cHF: 1.0, acidBaseDelta: 0.0 };
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });

  /* ==========================================================================
     2.4 难溶电解质的沉淀溶解平衡 K_sp 与 Q_c 判据 (ch2-ksp)
     ========================================================================== */
  ICChem.registerSim("ch2-ksp", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    const salts = {
      caf2: { name: "氟化钙 CaF₂ (晶圆厂含氟废水除氟)", formula: "CaF₂(s) ⇌ Ca²⁺ + 2F⁻", ksp: 3.9e-11, mPow: 1, xPow: 2, mIon: "Ca²⁺", xIon: "F⁻", color: "#e2e8f0" },
      agcl: { name: "氯化银 AgCl (卤素离子检验)", formula: "AgCl(s) ⇌ Ag⁺ + Cl⁻", ksp: 1.8e-10, mPow: 1, xPow: 1, mIon: "Ag⁺", xIon: "Cl⁻", color: "#f8fafc" },
      cuoh2: { name: "氢氧化铜 Cu(OH)₂ (电镀含铜废水沉铜)", formula: "Cu(OH)₂(s) ⇌ Cu²⁺ + 2OH⁻", ksp: 2.2e-20, mPow: 1, xPow: 2, mIon: "Cu²⁺", xIon: "OH⁻", color: "#38bdf8" }
    };

    let state = { key: "caf2", logM: -3.0, logX: -3.2 };
    const { resize } = ICChem.ui.createCanvas(viewport, 390);
    let animId = null;
    let tick = 0;

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "选择难溶电解质沉淀平衡体系",
          activeValue: state.key,
          fullSpan: true,
          options: Object.entries(salts).map(([k, s]) => ({ label: s.name, value: k })),
          onChange: (k) => { state.key = k; buildControls(); }
        }).el
      );
      const s = salts[state.key];
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: `投加阳离子 [${s.mIon}] 浓度指数 lg c`, min: -8.0, max: -0.5, step: 0.1, value: state.logM, unit: " (10^x M)",
          onInput: (v) => { state.logM = v; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: `初始阴离子 [${s.xIon}] 浓度指数 lg c`, min: -9.0, max: -1.0, step: 0.1, value: state.logX, unit: " (10^x M)",
          onInput: (v) => { state.logX = v; }
        }).el
      );
    }

    function render() {
      tick += 0.04;
      const s = salts[state.key];
      const cM = Math.pow(10, state.logM);
      const cX = Math.pow(10, state.logX);
      const Qc = Math.pow(cM, s.mPow) * Math.pow(cX, s.xPow);
      const isPrecip = Qc > s.ksp;

      // 计算平衡后由同离子效应压低的残留阴离子浓度
      const eqX = isPrecip ? Math.pow(s.ksp / cM, 1 / s.xPow) : cX;

      headerMetricsEl.textContent = `${s.formula} | Ksp = ${s.ksp.toExponential(2)}`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "离子积 Qc", value: Qc.toExponential(2), unit: "", tone: isPrecip ? "warning" : "positive" },
        { label: "溶度积常数 Ksp", value: s.ksp.toExponential(2), unit: "" },
        { label: "溶度积规则判据", value: isPrecip ? "Qc > Ksp 析出沉淀 ↓" : "Qc < Ksp 清亮不饱和", tone: isPrecip ? "warning" : "positive" },
        { label: `平衡上清液残留 [${s.xIon}]`, value: eqX.toExponential(2), unit: "mol/L" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧：反应烧杯与沉淀析出动画
      const bx = w * 0.25, by = 52, bw = 190, bh = 265;
      ctx.fillStyle = "rgba(56, 189, 248, 0.14)";
      ctx.fillRect(bx - bw / 2, by + 42, bw, bh - 42);

      if (isPrecip) {
        const pileH = Math.min(68, Math.max(12, (Math.log10(Qc / s.ksp)) * 8));
        // 飘落晶核
        ctx.fillStyle = s.color;
        for (let i = 0; i < 22; i++) {
          const px = bx - bw / 2 + 16 + ((i * 37) % (bw - 32));
          const py = by + 56 + (((tick * 35 + i * 23) % (bh - 56 - pileH)));
          ctx.beginPath();
          ctx.arc(px, py, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
        // 烧杯底沉积层
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(bx - bw / 2 + 3, by + bh - pileH, bw - 6, pileH - 2);
        ctx.globalAlpha = 1;
      }

      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bx - bw / 2, by);
      ctx.lineTo(bx - bw / 2, by + bh);
      ctx.lineTo(bx + bw / 2, by + bh);
      ctx.lineTo(bx + bw / 2, by);
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(isPrecip ? "过饱和：晶核生成并沉降析出" : "不饱和均相清亮溶液", bx, by + bh + 28);

      // 右侧：lg Qc 与 lg Ksp 对数标尺对比
      const rx = w * 0.48, ry = 46, rw = w - rx - 34, rh = h - 92;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, rx, ry, rw, rh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("溶度积对数标尺判据 (lg Qc vs lg Ksp)", rx + 18, ry + 28);

      const scaleX = rx + 24, scaleW = rw - 48, scaleY = ry + 95;
      ctx.fillStyle = "#1e293b";
      ICChem.ui.drawRoundRect(ctx, scaleX, scaleY, scaleW, 24, 12);
      ctx.fill();

      const minLg = -26, maxLg = -2;
      const mapLg = (lg) => scaleX + ((Math.max(minLg, Math.min(maxLg, lg)) - minLg) / (maxLg - minLg)) * scaleW;

      const kspX = mapLg(Math.log10(s.ksp));
      const qcX = mapLg(Math.log10(Qc));

      // Ksp 分界线
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(kspX, scaleY - 14);
      ctx.lineTo(kspX, scaleY + 38);
      ctx.stroke();
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 11.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`lg Ksp = ${Math.log10(s.ksp).toFixed(1)}`, kspX, scaleY - 20);

      // Qc 游标指针
      ctx.fillStyle = isPrecip ? "#fbbf24" : "#38bdf8";
      ctx.beginPath();
      ctx.arc(qcX, scaleY + 12, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`lg Qc = ${Math.log10(Qc).toFixed(1)}`, qcX, scaleY + 56);

      // 同离子效应提示
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`• 试着向右拖动 [${s.mIon}] 滑块增大沉淀剂浓度：`, rx + 22, ry + 205);
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`  利用【同离子效应】，残留 [${s.xIon}] 被压低至 ${eqX.toExponential(2)} mol/L！`, rx + 22, ry + 230);

      animId = requestAnimationFrame(render);
    }

    buildControls();
    render();

    return {
      reset() {
        state = { key: "caf2", logM: -3.0, logX: -3.2 };
        buildControls();
      },
      destroy() {
        if (animId) cancelAnimationFrame(animId);
      }
    };
  });

  /* ==========================================================================
     2.5 配位化合物与芯片铜互连配位平衡仿真 (ch2-coord)
     ========================================================================== */
  ICChem.registerSim("ch2-coord", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    const ligands = {
      h2o: {
        name: "水合铜离子 [Cu(H₂O)₆]²⁺ (弱碱下生成 Cu(OH)₂ 沉淀)",
        formula: "[Cu(H₂O)₆]²⁺",
        donor: "O",
        cn: 6,
        logKf: 0,
        color: "rgba(56, 189, 248, 0.45)",
        pptInWeakBase: true
      },
      nh3: {
        name: "氨配体 [Cu(NH₃)₄]²⁺ (深宝蓝色络离子，溶解氢氧化铜)",
        formula: "[Cu(NH₃)₄]²⁺",
        donor: "N (单齿)",
        cn: 4,
        logKf: 13.32,
        color: "rgba(37, 99, 235, 0.82)",
        pptInWeakBase: false
      },
      cit: {
        name: "柠檬酸配体 [Cu(Cit)]⁻ (Cu-CMP 后清洗无氨环保络合剂)",
        formula: "[Cu(C₆H₅O₇)]⁻",
        donor: "O (多齿螯合)",
        cn: 4,
        logKf: 14.2,
        color: "rgba(13, 148, 136, 0.72)",
        pptInWeakBase: false
      },
      edta: {
        name: "EDTA 强螯合剂 [CuY]²⁻ (六齿配体超稳定螯合物)",
        formula: "[Cu(EDTA)]²⁻",
        donor: "2N + 4O (六齿螯合)",
        cn: 6,
        logKf: 18.8,
        color: "rgba(79, 70, 229, 0.75)",
        pptInWeakBase: false
      }
    };

    let state = { key: "nh3", cLigand: 0.5, cCuTotal: 0.02 };
    const { resize } = ICChem.ui.createCanvas(viewport, 395);

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "切换配位体体系（对比沉淀转化与螯合效应）",
          activeValue: state.key,
          fullSpan: true,
          options: [
            { label: "无外加配体 (pH=9 生成 Cu(OH)₂↓)", value: "h2o" },
            { label: "NH₃ 氨水配体 (Kf = 10^13.3)", value: "nh3" },
            { label: "柠檬酸根 (CMP清洗液, Kf = 10^14.2)", value: "cit" },
            { label: "EDTA⁴⁻ 六齿螯合 (Kf = 10^18.8)", value: "edta" }
          ],
          onChange: (k) => { state.key = k; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "过量游离配体浓度 [L]", min: 0.05, max: 2.0, step: 0.05, value: state.cLigand, unit: " mol/L", fullSpan: true,
          onInput: (v) => { state.cLigand = v; draw(); }
        }).el
      );
    }

    function draw() {
      const lg = ligands[state.key];
      let freeCu;
      if (state.key === "h2o") {
        // pH=9 -> [OH-] = 1e-5, Ksp Cu(OH)2 = 2.2e-20 -> [Cu2+] = 2.2e-10 with solid precipitate
        freeCu = 2.2e-10;
      } else if (state.key === "nh3") {
        const Kf = Math.pow(10, lg.logKf);
        freeCu = state.cCuTotal / (1 + Kf * Math.pow(state.cLigand, 4));
      } else {
        const Kf = Math.pow(10, lg.logKf);
        freeCu = state.cCuTotal / (1 + Kf * state.cLigand);
      }

      // Check if Cu(OH)2 precipitates at pH=9 ([OH-]=1e-5 => Qc = freeCu * 1e-10 vs 2.2e-20)
      const hasPpt = freeCu * 1e-10 > 2.2e-20 || lg.pptInWeakBase;

      headerMetricsEl.textContent = `内界化学式：${lg.formula} | 配位原子：${lg.donor} | 配位数 CN = ${lg.cn}`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "累积稳定常数 lg Kf", value: lg.logKf > 0 ? lg.logKf.toFixed(2) : "基准水合", unit: "" },
        { label: "游离 [Cu²⁺] 平衡浓度", value: freeCu.toExponential(2), unit: "mol/L", tone: "positive" },
        { label: "配位数 (CN)", value: lg.cn, unit: "" },
        { label: "pH=9 弱碱性下状态", value: hasPpt ? "Cu(OH)₂ 蓝色絮状沉淀" : "络合清亮溶液 ✓", tone: hasPpt ? "warning" : "positive" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧：配位空间几何构型图 (CN=4 平面正方形 vs CN=6 八面体)
      const cx = w * 0.27, cy = h * 0.5;
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`中心离子与配体空间配位结构 (${lg.formula})`, cx, 36);

      // 内界方括号框
      ctx.strokeStyle = "rgba(148,163,184,0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 115, cy - 105, 230, 210);

      const angles = lg.cn === 4
        ? [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
        : [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];

      const rad = 76;
      angles.forEach((ang) => {
        const lx = cx + Math.cos(ang) * rad;
        const ly = cy + Math.sin(ang) * rad;

        // 配位键孤对电子箭头 (L -> Cu2+)
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(cx + Math.cos(ang) * 24, cy + Math.sin(ang) * 24);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(lx, ly, 17, 0, Math.PI * 2);
        ctx.fillStyle = "#1e293b";
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.stroke();
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 10.5px sans-serif";
        ctx.fillText(state.key === "nh3" ? "NH₃" : state.key === "h2o" ? "H₂O" : state.key === "cit" ? "Cit" : "N/O", lx, ly + 4);
      });

      // 中心 Cu2+
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fillStyle = "#f97316";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("Cu²⁺", cx, cy + 4);

      // 右侧：烧杯溶液真实呈色与沉淀溶解对比
      const bx = w * 0.72, by = 64, bw = 185, bh = 250;
      ctx.fillStyle = lg.color;
      ctx.fillRect(bx - bw / 2, by + 44, bw, bh - 44);

      if (hasPpt) {
        ctx.fillStyle = "#38bdf8";
        for (let i = 0; i < 18; i++) {
          ctx.beginPath();
          ctx.arc(bx - 65 + (i % 6) * 26, by + bh - 18 - Math.floor(i / 6) * 14, 9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bx - bw / 2, by);
      ctx.lineTo(bx - bw / 2, by + bh);
      ctx.lineTo(bx + bw / 2, by + bh);
      ctx.lineTo(bx + bw / 2, by);
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.fillText(hasPpt ? "Cu(OH)₂ 难溶沉淀未络合" : "强配位键锁住 Cu²⁺，沉淀彻底溶解！", bx, by + bh + 28);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11.5px sans-serif";
      ctx.fillText("CMP后清洗正是靠有机配体清除晶圆表面氧化铜残留", bx, by + bh + 48);
    }

    buildControls();
    draw();

    return {
      reset() {
        state = { key: "nh3", cLigand: 0.5, cCuTotal: 0.02 };
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });
})();
