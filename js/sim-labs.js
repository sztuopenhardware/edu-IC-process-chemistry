/* ==========================================================================
   《集成工艺化学》交互仿真引擎 — 课内实践五大必做实验项目 (lab1 ~ lab5)
   ========================================================================== */

(function () {
  const ICChem = window.ICChem;

  /* ==========================================================================
     实验一：实验室安全教育与基础化学实验操作
     (配制 200mL 0.1mol/L NaCl 溶液及用移液管测定液体密度)
     ========================================================================== */
  ICChem.registerSim("lab1-safety-nacl", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    let state = {
      ppeDone: true,
      washed: true,
      weighedMass: 1.1688, // 理论值 0.1 * 0.2 * 58.44 = 1.1688 g
      eyeMode: "level", // "down" (俯视->V偏小,c偏高), "level" (平视->准确), "up" (仰视->V偏大,c偏低)
      pipetteDone: true
    };
    const { resize } = ICChem.ui.createCanvas(viewport, 410);

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "工位1–2：安全防护穿戴与玻璃器皿洗涤检验",
          activeValue: state.ppeDone && state.washed ? "ok" : "warn",
          options: [
            { label: "✅ 已穿实验服/护目镜/手套 + 器皿水膜均匀合格", value: "ok" },
            { label: "⚠️ 模拟器皿内壁挂水珠未洗净", value: "warn" }
          ],
          onChange: (v) => { state.washed = v === "ok"; state.ppeDone = true; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "工位4：200 mL 容量瓶胶头滴管定容读数视线（误差探究）",
          activeValue: state.eyeMode,
          options: [
            { label: "👁️ 平视凹液面最低处相切 (标准)", value: "level" },
            { label: "↘️ 俯视刻度线 (V偏小)", value: "down" },
            { label: "↗️ 仰视刻度线 (V偏大)", value: "up" }
          ],
          onChange: (v) => { state.eyeMode = v; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "工位3：万分之一电子天平称取 NaCl 固体质量 m（理论需 1.1688 g）",
          min: 1.0500, max: 1.3000, step: 0.0010, value: state.weighedMass, unit: " g", fullSpan: true,
          onInput: (v) => { state.weighedMass = v; draw(); }
        }).el
      );
    }

    function draw() {
      const realVolMl = state.eyeMode === "level" ? 200.0 : state.eyeMode === "down" ? 196.8 : 203.4;
      const realConc = state.weighedMass / (58.44 * (realVolMl / 1000));
      // 20°C NaCl 水溶液密度经验公式 ρ ≈ 0.9982 + 0.0412 * c
      const rho = 0.9982 + 0.0412 * realConc + (state.washed ? 0 : 0.0018);
      const emptyBottleG = 18.4210;
      const total10mlG = emptyBottleG + rho * 10.0;

      headerMetricsEl.textContent = `目标：配制 200.0 mL 0.1000 mol/L NaCl 溶液 (需固体 1.1688 g) 并移取 10.00 mL 测定密度`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "电子天平实称 m(NaCl)", value: state.weighedMass.toFixed(4), unit: "g" },
        { label: "容量瓶实际体积 V", value: realVolMl.toFixed(1), unit: "mL", tone: state.eyeMode === "level" ? "positive" : "warning" },
        { label: "实际物质的量浓度 c", value: realConc.toFixed(4), unit: "mol/L", tone: Math.abs(realConc - 0.1) < 0.0015 ? "positive" : "warning" },
        { label: "10.00mL 实测密度 ρ", value: rho.toFixed(4), unit: "g/mL", tone: "positive" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      const third = (w - 64) / 3;

      // 面板1：万分之一分析天平 (0.0001 g)
      const p1x = 20, py = 32, ph = h - 64;
      ctx.fillStyle = "rgba(15,23,42,0.88)";
      ICChem.ui.drawRoundRect(ctx, p1x, py, third, ph, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("① 万分之一分析天平称量", p1x + third / 2, py + 26);

      // 防风玻璃罩
      ctx.strokeStyle = "rgba(186,230,253,0.45)";
      ctx.strokeRect(p1x + 28, py + 48, third - 56, 145);
      // 称量盘与称量纸上的白色 NaCl 晶体堆
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(p1x + third / 2 - 44, py + 168, 88, 7);
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(p1x + third / 2, py + 166, 22, Math.PI, 0);
      ctx.fill();

      // 天平底座 LCD 数显屏
      ctx.fillStyle = "#1e293b";
      ICChem.ui.drawRoundRect(ctx, p1x + 22, py + 195, third - 44, 62, 6);
      ctx.fill();
      ctx.fillStyle = "#064e3b";
      ctx.fillRect(p1x + 36, py + 208, third - 72, 34);
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 18px monospace";
      ctx.fillText(`${state.weighedMass.toFixed(4)} g`, p1x + third / 2, py + 231);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px sans-serif";
      ctx.fillText("已去皮调零 (Tare) · 防风门已闭合", p1x + third / 2, py + 282);
      ctx.fillStyle = state.washed ? "#34d399" : "#fbbf24";
      ctx.fillText(state.washed ? "✓ 器皿水膜均匀不挂水珠" : "⚠ 器皿挂水珠引入污染误差", p1x + third / 2, py + 306);

      // 面板2：200 mL 容量瓶定容弯月面放大图
      const p2x = p1x + third + 12;
      ctx.fillStyle = "rgba(15,23,42,0.88)";
      ICChem.ui.drawRoundRect(ctx, p2x, py, third, ph, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.fillText("② 200 mL 容量瓶定容视线", p2x + third / 2, py + 26);

      const nx = p2x + third / 2;
      const markY = py + 148;
      // 瓶颈放大管壁
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(nx - 34, py + 58);
      ctx.lineTo(nx - 34, py + 250);
      ctx.moveTo(nx + 34, py + 58);
      ctx.lineTo(nx + 34, py + 250);
      ctx.stroke();

      // 凹液面高度随俯视/平视/仰视变化
      const menY = state.eyeMode === "level" ? markY : state.eyeMode === "down" ? markY + 18 : markY - 18;
      ctx.fillStyle = "rgba(56,189,248,0.32)";
      ctx.beginPath();
      ctx.moveTo(nx - 33, menY - 9);
      ctx.quadraticCurveTo(nx, menY + 9, nx + 33, menY - 9);
      ctx.lineTo(nx + 33, py + 250);
      ctx.lineTo(nx - 33, py + 250);
      ctx.closePath();
      ctx.fill();

      // 凹液面轮廓线
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(nx - 33, menY - 9);
      ctx.quadraticCurveTo(nx, menY + 9, nx + 33, menY - 9);
      ctx.stroke();

      // 200mL 环形刻度线
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(nx - 40, markY);
      ctx.lineTo(nx + 40, markY);
      ctx.stroke();

      // 观察者眼睛视线虚线
      const eyeY = state.eyeMode === "level" ? markY : state.eyeMode === "down" ? markY - 38 : markY + 38;
      ctx.strokeStyle = state.eyeMode === "level" ? "#34d399" : "#fb7185";
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(nx + 82, eyeY);
      ctx.lineTo(nx, menY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = state.eyeMode === "level" ? "#34d399" : "#fb7185";
      ctx.font = "bold 11.5px sans-serif";
      ctx.fillText("👁️", nx + 90, eyeY + 4);
      ctx.fillText(
        state.eyeMode === "level" ? "平视相切：V = 200.0 mL 准确" : state.eyeMode === "down" ? "俯视：液面未到线，浓度偏高！" : "仰视：加水过线，浓度偏低！",
        nx,
        py + 292
      );

      // 面板3：10.00 mL 肚式移液管移液与密度计算
      const p3x = p2x + third + 12;
      ctx.fillStyle = "rgba(15,23,42,0.88)";
      ICChem.ui.drawRoundRect(ctx, p3x, py, third, ph, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.fillText("③ 10.00mL 移液管与密度测定", p3x + third / 2, py + 26);

      const px = p3x + third / 2;
      // 肚式移液管轮廓
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(px - 4, py + 48);
      ctx.lineTo(px - 4, py + 98);
      ctx.bezierCurveTo(px - 22, py + 115, px - 22, py + 165, px - 4, py + 182);
      ctx.lineTo(px - 2, py + 228);
      ctx.moveTo(px + 4, py + 48);
      ctx.lineTo(px + 4, py + 98);
      ctx.bezierCurveTo(px + 22, py + 115, px + 22, py + 165, px + 4, py + 182);
      ctx.lineTo(px + 2, py + 228);
      ctx.stroke();

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "11.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`• 空称量瓶 m₀ = ${emptyBottleG.toFixed(4)} g`, p3x + 18, py + 258);
      ctx.fillText(`• 移入10.00mL后 m₁ = ${total10mlG.toFixed(4)} g`, p3x + 18, py + 280);
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(`• 计算密度 ρ = (m₁−m₀)/10 = ${rho.toFixed(4)} g/mL`, p3x + 18, py + 304);
    }

    buildControls();
    draw();

    return {
      reset() {
        state = { ppeDone: true, washed: true, weighedMass: 1.1688, eyeMode: "level", pipetteDone: true };
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });

  /* ==========================================================================
     实验二：氯化钠的提纯（溶解-化学沉淀除杂顺序设计-抽滤-蒸发结晶与纯度检验）
     ========================================================================== */
  ICChem.registerSim("lab2-nacl-purify", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    function initialLab2() {
      return {
        crudeMass: 5.00,
        dissolved: true,
        ions: { sand: true, so4: true, mg: true, ca: true, ba: false, oh: false, co3: false },
        precipitatesInBeaker: false,
        filtered: false,
        acidified: false,
        evaporated: false,
        testedPurity: false,
        log: ["已称取 5.00 g 粗盐于烧杯中加 20 mL 纯水加热搅拌溶解（含泥沙、SO₄²⁻、Mg²⁺、Ca²⁺）。请按正确除杂逻辑点击下方操作！"],
        errorMsg: null
      };
    }

    let state = initialLab2();
    const { resize } = ICChem.ui.createCanvas(viewport, 415);

    function act(action) {
      state.errorMsg = null;
      if (state.evaporated && action !== "test") {
        state.errorMsg = "已蒸发结晶完毕！如需重新设计顺序，请点击右上角【重置仿真参数】。";
        draw();
        return;
      }

      if (action === "bacl2") {
        state.ions.so4 = false;
        state.ions.ba = true; // 过量 Ba2+
        state.precipitatesInBeaker = true;
        state.log.push("滴加稍过量 1 mol/L BaCl₂：SO₄²⁻ 完全转化为 BaSO₄↓，溶液中引入过量 Ba²⁺。");
      } else if (action === "naoh") {
        state.ions.mg = false;
        state.ions.oh = true;
        state.precipitatesInBeaker = true;
        state.log.push("滴加过量 2 mol/L NaOH：Mg²⁺ 转化为 Mg(OH)₂↓，溶液中含过量 OH⁻。");
      } else if (action === "na2co3") {
        state.ions.ca = false;
        if (state.ions.ba) {
          state.ions.ba = false;
          state.log.push("滴加过量 1 mol/L Na₂CO₃：同时将 Ca²⁺ 和前步过量的 Ba²⁺ 转化为 CaCO₃↓、BaCO₃↓！");
        } else {
          state.log.push("滴加过量 Na₂CO₃：除去 Ca²⁺（注意：若此后才加 BaCl₂，过量 Ba²⁺ 将无法被除去！）。");
        }
        state.ions.co3 = true;
        state.precipitatesInBeaker = true;
      } else if (action === "filter") {
        state.ions.sand = false;
        state.precipitatesInBeaker = false;
        state.filtered = true;
        state.log.push("进行布氏漏斗减压抽滤：泥沙与全部难溶硫酸盐/氢氧化物/碳酸盐沉淀被截留滤除，得到滤液！");
      } else if (action === "hcl") {
        if (state.precipitatesInBeaker && !state.filtered) {
          // 经典错误：未过滤就加盐酸，沉淀复溶！
          state.ions.mg = true;
          state.ions.ca = true;
          state.errorMsg = "❌ 严重操作失误：未先过滤除去沉淀就直接滴加稀盐酸，导致 Mg(OH)₂、CaCO₃、BaCO₃ 沉淀遇酸重新溶解返回溶液中！";
          state.log.push(state.errorMsg);
        } else {
          state.ions.oh = false;
          state.ions.co3 = false;
          state.acidified = true;
          state.log.push("向清亮滤液滴加稀 HCl 调至 pH = 2–3：过量 OH⁻ 与 CO₃²⁻ 转化为 H₂O 和 CO₂↑ 被彻底除去！");
        }
      } else if (action === "evap") {
        if (!state.filtered) {
          state.errorMsg = "⚠️ 尚未过滤泥沙与沉淀！必须在过滤并加稀盐酸调 pH 后再蒸发结晶。";
        } else {
          state.evaporated = true;
          state.log.push("加热台蒸发皿浓缩：出现较多 NaCl 晶体、剩少量母液时关闭热源余热蒸干（驱除挥发性 HCl），称重计算产率！");
        }
      } else if (action === "test") {
        state.testedPurity = true;
        const hasImpurity = state.ions.so4 || state.ions.mg || state.ions.ca || state.ions.ba || state.ions.oh || state.ions.co3 || state.ions.sand;
        state.log.push(
          hasImpurity
            ? "❌ 纯度检验不合格：取少量产品溶水滴加 Na₂SO₄/Na₂CO₃/酚酞出现浑浊或显色，说明除杂顺序有误残留杂质离子！"
            : "✅ 产品纯度检验优等：滴加 Na₂SO₄ 无 Ba²⁺ 浑浊，滴加 BaCl₂ 无 SO₄²⁻ 浑浊，pH 中性，获得高纯精制 NaCl 晶体！"
        );
      }
      draw();
    }

    function buildControls() {
      controlsEl.innerHTML = "";
      const wrap = document.createElement("div");
      wrap.className = "control-item full-span";
      wrap.innerHTML = `
        <div class="control-header"><span class="control-name">🧪 设计性实验操作台：请按严谨化学除杂顺序依次点击执行（可尝试错误顺序观察后果）</span></div>
        <div class="control-btn-group">
          <button type="button" class="chip-btn" data-act="bacl2">① 加过量 BaCl₂ (除SO₄²⁻)</button>
          <button type="button" class="chip-btn" data-act="naoh">② 加过量 NaOH (除Mg²⁺)</button>
          <button type="button" class="chip-btn" data-act="na2co3">③ 加过量 Na₂CO₃ (除Ca²⁺及过量Ba²⁺)</button>
          <button type="button" class="chip-btn" data-act="filter">④ 减压抽滤分离沉淀</button>
          <button type="button" class="chip-btn" data-act="hcl">⑤ 滴加稀 HCl 调 pH=2~3</button>
          <button type="button" class="chip-btn" data-act="evap">⑥ 蒸发皿控温余热结晶</button>
          <button type="button" class="chip-btn" data-act="test">⑦ 检验精盐纯度</button>
        </div>
      `;
      wrap.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => act(btn.dataset.act));
      });
      controlsEl.appendChild(wrap);
    }

    function draw() {
      const impList = [
        ["泥沙", state.ions.sand],
        ["SO₄²⁻", state.ions.so4],
        ["Mg²⁺", state.ions.mg],
        ["Ca²⁺", state.ions.ca],
        ["过量Ba²⁺", state.ions.ba],
        ["过量OH⁻", state.ions.oh],
        ["过量CO₃²⁻", state.ions.co3]
      ];
      const remCount = impList.filter((x) => x[1]).length;
      const pureMass = state.evaporated ? (remCount === 0 ? 4.28 : 4.55) : 0;
      const yieldPct = state.evaporated ? ((pureMass / state.crudeMass) * 100).toFixed(1) : "待结晶";

      headerMetricsEl.textContent = `粗盐样品 m₀ = 5.00 g | 关键铁律：Na₂CO₃ 必须在 BaCl₂ 之后，稀 HCl 必须在过滤之后！`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "溶液中残留杂质种类", value: remCount, unit: "项", tone: remCount === 0 ? "positive" : "warning" },
        { label: "固液分离状态", value: state.filtered ? "已抽滤清亮 ✓" : "未过滤", unit: "" },
        { label: "精盐产品实得质量", value: state.evaporated ? pureMass.toFixed(2) : "—", unit: state.evaporated ? "g" : "" },
        { label: "氯化钠提纯产率 η", value: yieldPct, unit: state.evaporated ? "%" : "", tone: remCount === 0 && state.evaporated ? "positive" : "" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 上部：7项杂质离子实时追踪矩阵徽章
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("溶液体系杂质离子实时追踪看板（绿色=已彻底除去，红色=当前存在）：", 34, 34);

      const chipW = (w - 88) / impList.length;
      impList.forEach(([name, present], i) => {
        const cx = 34 + i * (chipW + 4);
        ctx.fillStyle = present ? "rgba(251, 113, 133, 0.2)" : "rgba(52, 211, 153, 0.18)";
        ICChem.ui.drawRoundRect(ctx, cx, 48, chipW - 4, 46, 7);
        ctx.fill();
        ctx.strokeStyle = present ? "#fb7185" : "#34d399";
        ctx.stroke();
        ctx.fillStyle = present ? "#fda4af" : "#6ee7b7";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(name, cx + (chipW - 4) / 2, 68);
        ctx.font = "11px sans-serif";
        ctx.fillText(present ? "● 残留中" : "✓ 已除尽", cx + (chipW - 4) / 2, 86);
      });

      // 左下：实验器皿状态图（烧杯沉淀 / 布氏漏斗抽滤瓶 / 加热台蒸发皿结晶）
      const lx = 34, ly = 112, lw = w * 0.42 - 44, lh = h - 134;
      ctx.fillStyle = "rgba(15,23,42,0.88)";
      ICChem.ui.drawRoundRect(ctx, lx, ly, lw, lh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      const midX = lx + lw / 2;
      ctx.textAlign = "center";
      if (!state.evaporated) {
        // 绘制烧杯或滤液
        ctx.fillStyle = "rgba(56,189,248,0.2)";
        ctx.fillRect(midX - 65, ly + 65, 130, 145);
        if (state.precipitatesInBeaker || state.ions.sand) {
          ctx.fillStyle = state.ions.sand ? "#92400e" : "#f1f5f9";
          ctx.fillRect(midX - 62, ly + 182, 124, 26);
        }
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(midX - 65, ly + 42, 130, 168);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 12.5px sans-serif";
        ctx.fillText(state.filtered ? "减压抽滤后清亮滤液" : "反应烧杯 (含固相沉淀/泥沙)", midX, ly + 238);
      } else {
        // 绘制数显加热台 + 瓷蒸发皿洁白 NaCl 晶粒
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(midX - 80, ly + 188, 160, 18);
        ctx.fillStyle = "#334155";
        ctx.fillRect(midX - 90, ly + 206, 180, 24);
        // 瓷蒸发皿半圆弧
        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(midX, ly + 130, 62, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        // 洁白食盐立方晶体颗粒
        ctx.fillStyle = remCount === 0 ? "#ffffff" : "#fde047";
        for (let k = -4; k <= 4; k++) {
          ctx.fillRect(midX + k * 9 - 4, ly + 172 - Math.abs(k) * 2, 7, 7);
        }
        ctx.fillStyle = "#34d399";
        ctx.font = "bold 12.5px sans-serif";
        ctx.fillText(`余热蒸发结晶完毕：精盐 ${pureMass.toFixed(2)} g (产率 ${yieldPct}%)`, midX, ly + 255);
      }

      // 右下：实时实验记录日志簿
      const rx = w * 0.42 + 8, ry = 112, rw = w - rx - 34, rh = h - 134;
      ctx.fillStyle = "rgba(15,23,42,0.88)";
      ICChem.ui.drawRoundRect(ctx, rx, ry, rw, rh, 10);
      ctx.fill();
      ctx.strokeStyle = state.errorMsg ? "#fb7185" : "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("📋 实验步骤与现象实时记录：", rx + 16, ry + 26);

      const recentLogs = state.log.slice(-6);
      ctx.font = "11.5px sans-serif";
      recentLogs.forEach((line, idx) => {
        ctx.fillStyle = line.includes("❌") || line.includes("⚠️") ? "#fda4af" : line.includes("✅") ? "#6ee7b7" : "#cbd5e1";
        const maxC = Math.max(24, Math.floor((rw - 36) / 12));
        const shortLine = line.length > maxC ? line.slice(0, maxC) + "…" : line;
        ctx.fillText(`${idx + 1}. ${shortLine}`, rx + 16, ry + 54 + idx * 34);
      });
    }

    buildControls();
    draw();

    return {
      reset() {
        state = initialLab2();
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });

  /* ==========================================================================
     实验三：溶液的配制及酸碱滴定（标准 NaOH 滴定待测 HCl、弯月面估读与突跃曲线）
     ========================================================================== */
  ICChem.registerSim("lab3-titration", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    const TRUE_C_HCL = 0.1002; // 待测 HCl 真实浓度 mol/L (20.00 mL -> 计量点 V_eq = 20.04 mL!)
    const C_NAOH = 0.1000;
    const V_HCL = 20.00;

    let state = {
      rinsedBurette: true,
      indicator: "pp", // "pp" 酚酞 (8.2~10.0), "mo" 甲基橙 (3.1~4.4)
      volAdded: 0.00,
      trials: [20.04, 20.02] // 预置前两次平行记录，鼓励学生亲手滴出第3次平行数据！
    };
    const { resize } = ICChem.ui.createCanvas(viewport, 415);

    function calcPH(vBase) {
      const effCNaOH = state.rinsedBurette ? C_NAOH : C_NAOH * 0.965; // 未润洗被管壁水稀释!
      const nAcid = TRUE_C_HCL * V_HCL; // mmol
      const nBase = effCNaOH * vBase;   // mmol
      const totalV = V_HCL + vBase;
      if (Math.abs(nAcid - nBase) < 1e-5) return 7.00;
      if (nAcid > nBase) {
        const h = (nAcid - nBase) / totalV;
        return -Math.log10(h);
      } else {
        const oh = (nBase - nAcid) / totalV;
        return 14.0 + Math.log10(oh);
      }
    }

    function getFlaskColor(ph) {
      if (state.indicator === "pp") {
        if (ph < 8.1) return "rgba(226, 232, 240, 0.18)"; // 无色透明
        if (ph <= 9.8) return "rgba(244, 114, 182, 0.36)"; // 标准终点：浅粉红色！
        return "rgba(219, 39, 119, 0.82)"; // 过量：深紫洋红色！
      } else {
        if (ph < 3.1) return "rgba(239, 68, 68, 0.65)"; // 酸色红
        if (ph <= 4.4) return "rgba(251, 146, 60, 0.62)"; // 变色点橙色
        return "rgba(250, 204, 21, 0.58)"; // 碱色亮黄
      }
    }

    function addBase(dv) {
      state.volAdded = Math.min(28.00, Number((state.volAdded + dv).toFixed(2)));
      draw();
    }

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "滴定前准备：碱式滴定管标准液润洗检查 & 指示剂选择",
          activeValue: state.indicator + "_" + (state.rinsedBurette ? "ok" : "no"),
          fullSpan: true,
          options: [
            { label: "酚酞指示剂 + 已润洗排气泡 (标准)", value: "pp_ok" },
            { label: "甲基橙指示剂 + 已润洗 (标准)", value: "mo_ok" },
            { label: "⚠️ 模拟未用标准NaOH润洗滴定管 (误差探究)", value: "pp_no" }
          ],
          onChange: (val) => {
            const [ind, r] = val.split("_");
            state.indicator = ind;
            state.rinsedBurette = r === "ok";
            draw();
          }
        }).el
      );

      const actWrap = document.createElement("div");
      actWrap.className = "control-item full-span";
      actWrap.innerHTML = `
        <div class="control-header"><span class="control-name">💧 挤压碱式滴定管玻璃珠乳胶管滴加 0.1000 mol/L NaOH（接近 20 mL 时请改用半滴精控！）</span></div>
        <div class="control-btn-group">
          <button type="button" class="chip-btn" id="tFast">+2.00 mL 快滴</button>
          <button type="button" class="chip-btn" id="tMed">+0.50 mL 慢滴</button>
          <button type="button" class="chip-btn" id="tDrop">+0.05 mL 逐滴 (1滴)</button>
          <button type="button" class="chip-btn active" id="tHalf">+0.02 mL 半滴精控靠壁冲洗</button>
          <button type="button" class="chip-btn" id="tRecord">📝 记录终点体积做平行计算</button>
          <button type="button" class="chip-btn" id="tZero">↺ 滴定管重新调零 (0.00 mL)</button>
        </div>
      `;
      actWrap.querySelector("#tFast").addEventListener("click", () => addBase(2.00));
      actWrap.querySelector("#tMed").addEventListener("click", () => addBase(0.50));
      actWrap.querySelector("#tDrop").addEventListener("click", () => addBase(0.05));
      actWrap.querySelector("#tHalf").addEventListener("click", () => addBase(0.02));
      actWrap.querySelector("#tZero").addEventListener("click", () => { state.volAdded = 0.00; draw(); });
      actWrap.querySelector("#tRecord").addEventListener("click", () => {
        if (state.volAdded > 5) {
          state.trials.push(state.volAdded);
          if (state.trials.length > 3) state.trials.shift();
          draw();
        }
      });
      controlsEl.appendChild(actWrap);
    }

    function draw() {
      const ph = calcPH(state.volAdded);
      const calcConc = (C_NAOH * state.volAdded) / V_HCL;
      const avgV = state.trials.reduce((a, b) => a + b, 0) / state.trials.length;
      const avgC = (C_NAOH * avgV) / V_HCL;

      const isEndPoint = (state.indicator === "pp" && ph >= 8.1 && ph <= 9.8) || (state.indicator === "mo" && ph >= 4.0 && ph <= 6.5);
      const isOver = (state.indicator === "pp" && ph > 9.85) || (state.indicator === "mo" && ph > 9.5);

      headerMetricsEl.textContent = `待测 HCl 移取体积 V = 20.00 mL | 标准 NaOH 浓度 c = 0.1000 mol/L | 平行滴定均值 c̄ = ${avgC.toFixed(4)} mol/L`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "滴定管读数 V(NaOH)", value: state.volAdded.toFixed(2), unit: "mL (0.01估读)" },
        { label: "锥形瓶溶液实时 pH", value: ph.toFixed(2), unit: "", tone: isEndPoint ? "positive" : isOver ? "danger" : "" },
        { label: "本次测得 c(HCl)", value: calcConc.toFixed(4), unit: "mol/L (真值0.1002)" },
        { label: "终点颜色判据", value: isEndPoint ? "微粉红/橙 30s不褪 ✓" : isOver ? "滴定过量偏深!" : "尚未到达终点", tone: isEndPoint ? "positive" : isOver ? "danger" : "warning" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧：碱式滴定管 + 锥形瓶变色 + 弯月面高倍放大镜
      const bx = w * 0.22;
      // 滴定管管身
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.strokeRect(bx - 9, 26, 18, 175);
      const liqY = 34 + (state.volAdded / 28) * 150;
      ctx.fillStyle = "rgba(56,189,248,0.35)";
      ctx.fillRect(bx - 8, liqY, 16, 201 - liqY);
      // 乳胶管玻璃珠特征
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(bx, 212, 6, 0, Math.PI * 2);
      ctx.fill();

      // 锥形瓶 Erlenmeyer Flask
      const fy = 238;
      ctx.beginPath();
      ctx.moveTo(bx - 16, fy);
      ctx.lineTo(bx - 16, fy + 28);
      ctx.lineTo(bx - 58, fy + 122);
      ctx.lineTo(bx + 58, fy + 122);
      ctx.lineTo(bx + 16, fy + 28);
      ctx.lineTo(bx + 16, fy);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2.4;
      ctx.stroke();

      ctx.save();
      ctx.clip();
      ctx.fillStyle = getFlaskColor(ph);
      ctx.fillRect(bx - 65, fy + 68, 130, 60);
      ctx.restore();

      // 弯月面 0.01 mL 估读放大圆窗
      const magX = bx + 98, magY = 108;
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(magX, magY, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "10.5px monospace";
      ctx.textAlign = "left";
      const baseInt = Math.floor(state.volAdded);
      ctx.fillText(`${baseInt}.0`, magX + 12, magY - 18);
      ctx.fillText(`${baseInt + 1}.0`, magX + 12, magY + 26);
      // 放大凹液面
      const subFrac = state.volAdded - baseInt;
      const mLineY = magY - 22 + subFrac * 44;
      ctx.strokeStyle = "#38bdf8";
      ctx.beginPath();
      ctx.moveTo(magX - 24, mLineY - 5);
      ctx.quadraticCurveTo(magX - 4, mLineY + 5, magX + 8, mLineY - 5);
      ctx.stroke();
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 11.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`估读: ${state.volAdded.toFixed(2)} mL`, magX, magY + 64);

      // 右侧：pH - V(NaOH) 实时滴定突跃曲线与指示剂变色域
      const gx = w * 0.43, gy = 38, gw = w - gx - 34, gh = h - 84;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ctx.fillRect(gx, gy, gw, gh);
      ctx.strokeStyle = "#475569";
      ctx.strokeRect(gx, gy, gw, gh);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("强碱滴定强酸 pH–V 突跃曲线（观察 20.04 mL 处垂直突跃！）", gx + 12, gy - 10);

      const mapV = (v) => gx + (v / 28) * gw;
      const mapPH = (p) => gy + gh - (p / 14) * (gh - 16) - 8;

      // 绘制酚酞变色域 (pH 8.2–10.0) 与甲基橙变色域 (3.1–4.4)
      ctx.fillStyle = "rgba(244, 114, 182, 0.16)";
      ctx.fillRect(gx, mapPH(10.0), gw, mapPH(8.2) - mapPH(10.0));
      ctx.fillStyle = "#f472b6";
      ctx.font = "10.5px sans-serif";
      ctx.fillText("酚酞变色区 (pH 8.2–10.0)", gx + 10, mapPH(9.0));

      ctx.fillStyle = "rgba(251, 146, 60, 0.15)";
      ctx.fillRect(gx, mapPH(4.4), gw, mapPH(3.1) - mapPH(4.4));
      ctx.fillStyle = "#fb923c";
      ctx.fillText("甲基橙变色区 (pH 3.1–4.4)", gx + 10, mapPH(3.7));

      // 理论完整滴定灰虚线
      ctx.strokeStyle = "rgba(148,163,184,0.32)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let v = 0; v <= 28; v += 0.1) {
        const x = mapV(v), y = mapPH(calcPH(v));
        if (v === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 已滴加实线轨迹
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let v = 0; v <= state.volAdded + 0.001; v += 0.05) {
        const cv = Math.min(state.volAdded, v);
        const x = mapV(cv), y = mapPH(calcPH(cv));
        if (v === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 当前滴定点
      ctx.fillStyle = isEndPoint ? "#34d399" : "#fbbf24";
      ctx.beginPath();
      ctx.arc(mapV(state.volAdded), mapPH(ph), 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11.5px sans-serif";
      ctx.fillText(`平行实验记录 V(mL): [${state.trials.map((x) => x.toFixed(2)).join(", ")}] → 均值 c(HCl) = ${avgC.toFixed(4)} mol/L`, gx + 10, gy + gh + 22);
    }

    buildControls();
    draw();

    return {
      reset() {
        state = { rinsedBurette: true, indicator: "pp", volAdded: 0.00, trials: [20.04, 20.02] };
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });

  /* ==========================================================================
     实验四：正性光刻胶图形化及光刻工艺流程 (匀胶机+加热台+曝光机实操)
     ========================================================================== */
  ICChem.registerSim("lab4-pos-litho", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    let state = { rpm: 3500, softBakeC: 100, uvPower: 12, expSec: 8.0, devSec: 45 };
    const { resize } = ICChem.ui.createCanvas(viewport, 410);

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "匀胶机高速转速 ω (调控 AZ 正胶厚度)", min: 1500, max: 5500, step: 250, value: state.rpm, unit: " rpm",
          onInput: (v) => { state.rpm = v; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "数显加热台前烘温度 (最佳 95–105°C)", min: 65, max: 145, step: 5, value: state.softBakeC, unit: " °C",
          onInput: (v) => { state.softBakeC = v; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "紫外光刻曝光时间 t_exp (光强 I = 12 mW/cm²)", min: 2.0, max: 18.0, step: 0.5, value: state.expSec, unit: " s",
          onInput: (v) => { state.expSec = v; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "2.38% TMAH 显影浸泡时间 t_dev", min: 15, max: 90, step: 5, value: state.devSec, unit: " s",
          onInput: (v) => { state.devSec = v; draw(); }
        }).el
      );
    }

    function draw() {
      const filmUm = 88 / Math.sqrt(state.rpm); // ~1.49 um at 3500 rpm
      const dose = state.uvPower * state.expSec; // mJ/cm2; optimal for ~1.5um positive resist is ~85-115 mJ/cm2
      const optDose = filmUm * 65;

      // 计算掩模 10.0 μm 铬遮光线条在显影后的实际正胶线宽 CD (μm) 与底膜残留
      let scum = 0;
      let cdUm = 10.0;
      let status = "标准正胶图形：线条陡直清晰 ✓";
      let tone = "positive";

      if (state.softBakeC > 130) {
        scum = 0.6;
        status = "前烘温度过高：DNQ感光剂热分解，无法显影清底！";
        tone = "danger";
      } else if (dose < optDose * 0.78 || state.devSec < 25) {
        scum = Math.min(0.8, (optDose - dose) / optDose);
        cdUm = 10.0 + 1.4;
        status = "欠曝光 / 显影不足：沟槽底部存在光刻胶残留 (Scumming)！";
        tone = "warning";
      } else if (dose > optDose * 1.35 || state.devSec > 75) {
        cdUm = Math.max(3.2, 10.0 - ((dose - optDose) / optDose) * 5.2 - (state.devSec - 45) * 0.04);
        status = "过曝光 / 过显影：正胶线条被严重横向侵蚀变窄！";
        tone = "warning";
      } else {
        cdUm = 10.0 - ((dose - optDose) / optDose) * 0.6;
      }

      headerMetricsEl.textContent = `设备联动：匀胶机(${state.rpm} rpm) → 加热台(${state.softBakeC}°C) → 紫外曝光机(Dose=${dose.toFixed(0)} mJ/cm²) → TMAH显影`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "正胶旋涂膜厚 d", value: filmUm.toFixed(2), unit: "μm" },
        { label: "实际曝光剂量 E = I·t", value: dose.toFixed(1), unit: `mJ/cm² (最佳~${optDose.toFixed(0)})` },
        { label: "实测微米胶线宽度 CD", value: cdUm.toFixed(2), unit: "μm (掩模10.0)", tone },
        { label: "图形质量评定", value: tone === "positive" ? "优等线条 ✓" : "偏离工艺窗口", tone }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左上：4英寸硅晶圆宏观俯视图 + 三台设备仪表缩略图
      const lx = 36, ly = 32, lw = w * 0.40 - 44, lh = h - 64;
      ctx.fillStyle = "rgba(15,23,42,0.88)";
      ICChem.ui.drawRoundRect(ctx, lx, ly, lw, lh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      const wcx = lx + lw / 2, wcy = ly + 150, wr = Math.min(92, lw * 0.36);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("硅晶圆涂胶曝光宏观形貌", wcx, ly + 26);

      const wGrad = ctx.createRadialGradient(wcx - 18, wcy - 18, 10, wcx, wcy, wr);
      wGrad.addColorStop(0, "#be123c");
      wGrad.addColorStop(0.75, "#9f1239");
      wGrad.addColorStop(1, "#4c0519");
      ctx.beginPath();
      ctx.arc(wcx, wcy, wr, 0, Math.PI * 2);
      ctx.fillStyle = wGrad;
      ctx.fill();
      ctx.strokeStyle = "#fda4af";
      ctx.stroke();

      // 晶圆中心曝光阵列方格 Die
      for (let r = -2; r <= 1; r++) {
        for (let c = -2; c <= 1; c++) {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
          ctx.strokeRect(wcx + c * 24 + 4, wcy + r * 24 + 4, 20, 20);
        }
      }
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "11.5px sans-serif";
      ctx.fillText("4英寸 (100mm) 单晶硅片 · AZ正性光刻胶", wcx, ly + lh - 22);

      // 右侧：金相显微镜 500× 俯视视场 + 线条横截面轮廓图
      const rx = w * 0.42, ry = 32, rw = w - rx - 32, rh = h - 64;
      ctx.fillStyle = "rgba(15,23,42,0.88)";
      ICChem.ui.drawRoundRect(ctx, rx, ry, rw, rh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("金相光学显微镜观测 (10 μm 掩模线/间阵列) 与横截面轮廓", rx + rw / 2, ry + 26);

      // 上半：显微镜俯视条纹 (掩模遮光区保留玫红色正胶条，透光区露出灰蓝色硅面)
      const mx = rx + 30, my = ry + 44, mw = rw - 60, mh = 135;
      ctx.fillStyle = scum > 0.15 ? "rgba(190, 18, 60, 0.45)" : "#1e3a5f"; // 若清底干净呈硅蓝灰；欠曝残胶呈暗红污底
      ctx.fillRect(mx, my, mw, mh);

      const pitchPx = mw / 5;
      const linePx = (cdUm / 20.0) * pitchPx;
      for (let i = 0; i < 5; i++) {
        const cxLine = mx + (i + 0.5) * pitchPx;
        ctx.fillStyle = "#e11d48";
        ctx.fillRect(cxLine - linePx / 2, my + 12, linePx, mh - 24);
      }
      ctx.strokeStyle = "#94a3b8";
      ctx.strokeRect(mx, my, mw, mh);

      // 下半：对应正胶横截面梯形轮廓
      const sy = ry + 275;
      ctx.fillStyle = "#334155";
      ctx.fillRect(mx, sy, mw, 32);
      if (scum > 0.05) {
        ctx.fillStyle = "rgba(225, 29, 72, 0.7)";
        ctx.fillRect(mx, sy - scum * 32, mw, scum * 32);
      }
      const hPx = Math.min(68, filmUm * 34);
      for (let i = 0; i < 5; i++) {
        const cxLine = mx + (i + 0.5) * pitchPx;
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.moveTo(cxLine - linePx / 2 + 3, sy - hPx);
        ctx.lineTo(cxLine + linePx / 2 - 3, sy - hPx);
        ctx.lineTo(cxLine + linePx / 2 + 3, sy);
        ctx.lineTo(cxLine - linePx / 2 - 3, sy);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = tone === "positive" ? "#34d399" : tone === "warning" ? "#fbbf24" : "#fb7185";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(status, rx + rw / 2, ry + rh - 14);
    }

    buildControls();
    draw();

    return {
      reset() {
        state = { rpm: 3500, softBakeC: 100, uvPower: 12, expSec: 8.0, devSec: 45 };
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });

  /* ==========================================================================
     实验五：负性光刻胶图形化、显微镜对比表征与大纲百分制实验考核 (lab5-neg-compare)
     ========================================================================== */
  ICChem.registerSim("lab5-neg-compare", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    let state = { pattern: "lines", negDose: 65, devTime: 50, rulerPos: 50 };
    const { resize } = ICChem.ui.createCanvas(viewport, 420);

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "选择同一块测试光掩模版图形（对比正胶同相传递 vs 负胶反相互补传递！）",
          activeValue: state.pattern,
          fullSpan: true,
          options: [
            { label: "10 μm 微米线宽分辨率靶 (铬条遮光)", value: "lines" },
            { label: "微米方孔阵列 (中心透光，四周铬遮光)", value: "holes" },
            { label: "芯片字母版 “IC” (字母区透明透光)", value: "text" }
          ],
          onChange: (p) => { state.pattern = p; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "负性光刻胶曝光剂量 E（过低根部未交联脱落；过高交联溶胀变粗）",
          min: 15, max: 140, step: 5, value: state.negDose, unit: " mJ/cm²",
          onInput: (v) => { state.negDose = v; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "显微镜目镜测微标尺水平移动游标（量测微米图形 CD）",
          min: 10, max: 90, step: 1, value: state.rulerPos, unit: " %",
          onInput: (v) => { state.rulerPos = v; draw(); }
        }).el
      );
    }

    function draw() {
      // 负胶最佳剂量 55~80 mJ/cm2
      let negStatus = "负胶交联适中：获得清晰互补反相微米图形 ✓";
      let tone = "positive";
      let swell = 0;
      let liftoffFail = false;

      if (state.negDose < 38) {
        liftoffFail = true;
        negStatus = "负胶欠曝光(<38 mJ/cm²)：底部未交联，显影时胶条整根漂浮倒塌！";
        tone = "danger";
      } else if (state.negDose > 98) {
        swell = (state.negDose - 98) * 0.22;
        negStatus = "负胶过曝光(>98 mJ/cm²)：光交联过度+溶剂溶胀引起相邻线条桥连 (Bridging)！";
        tone = "warning";
      }

      // 依据教学大纲实验评分规则自动核算模拟实验得分 (20+20+40+15+5=100)
      const opScore = liftoffFail ? 11 : swell > 4 ? 15 : 20;
      const dataScore = liftoffFail ? 24 : swell > 4 ? 32 : 39;
      const totalLabScore = 20 + opScore + dataScore + 15 + 5; // 预习20 + 操作 + 数据 + 思考题15 + 印象5

      headerMetricsEl.textContent = `双视场金相显微镜拍照对比：正性光刻胶(同相) vs 负性光刻胶(反相互补) | 大纲实验考核自动评分`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "正胶图形极性", value: "与掩模同相 (1:1)", unit: "" },
        { label: "负胶图形极性", value: "与掩模反相互补", unit: "" },
        { label: "负胶实测透光区交联CD", value: liftoffFail ? "脱落失效" : (10.0 + swell * 0.7).toFixed(1), unit: liftoffFail ? "" : "μm", tone },
        { label: "本实验大纲百分制得分", value: totalLabScore, unit: "/ 100分", tone: totalLabScore >= 90 ? "positive" : "warning" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 顶部：掩模版透光/遮光示意图条
      ctx.fillStyle = "rgba(15,23,42,0.9)";
      ICChem.ui.drawRoundRect(ctx, 28, 16, w - 56, 42, 7);
      ctx.fill();
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        state.pattern === "lines"
          ? "光掩模母版：3条宽 10 μm 不透光铬条 [遮光] + 间隔 10 μm 透明石英缝 [透光]"
          : state.pattern === "holes"
          ? "光掩模母版：大面积铬膜遮光，仅中央 4 个 10×10 μm 透明方窗 [透光]"
          : "光掩模母版：背景铬膜遮光，中央透明字母 “IC” [透光]",
        w / 2,
        42
      );

      // 左右并排两个圆形/方形金相显微镜观测视场
      const panelW = (w - 76) / 2;
      const drawScope = (x, title, isPos) => {
        const y = 70, ph = 258;
        ctx.fillStyle = "#111c30";
        ICChem.ui.drawRoundRect(ctx, x, y, panelW, ph, 10);
        ctx.fill();
        ctx.strokeStyle = isPos ? "#38bdf8" : "#a855f7";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = isPos ? "#38bdf8" : "#c084fc";
        ctx.font = "bold 12.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(title, x + panelW / 2, y + 24);

        const vx = x + 26, vy = y + 38, vw = panelW - 52, vh = ph - 66;
        // 裸硅衬底底色（银灰蓝）
        ctx.fillStyle = "#334155";
        ctx.fillRect(vx, vy, vw, vh);

        const resistColor = isPos ? "#e11d48" : "#7c3aed";

        if (state.pattern === "lines") {
          // 掩模：3条遮光铬条，4道透光区
          if (isPos) {
            // 正胶：遮光处留下3条光刻胶
            [0.22, 0.5, 0.78].forEach((frac) => {
              ctx.fillStyle = resistColor;
              ctx.fillRect(vx + vw * frac - 16, vy + 18, 32, vh - 36);
            });
          } else {
            // 负胶：4道透光处发生光交联留下4条负胶，遮光铬条下变成露硅沟槽！
            [0.08, 0.36, 0.64, 0.92].forEach((frac, idx) => {
              ctx.save();
              ctx.fillStyle = resistColor;
              if (liftoffFail) {
                ctx.translate(vx + vw * frac, vy + vh / 2);
                ctx.rotate(0.35 * (idx % 2 === 0 ? 1 : -1));
                ctx.fillRect(-12, -55, 24, 110);
              } else {
                const wBar = 30 + swell * 2.5;
                ctx.fillRect(vx + vw * frac - wBar / 2, vy + 18, wBar, vh - 36);
              }
              ctx.restore();
            });
          }
        } else if (state.pattern === "holes") {
          // 掩模：四周铬遮光，4个小方孔透光
          if (isPos) {
            // 正胶：整片保留胶膜，仅4个透光窗被显影挖成露硅接触孔 (Contact Holes)!
            ctx.fillStyle = resistColor;
            ctx.fillRect(vx, vy, vw, vh);
            ctx.fillStyle = "#334155";
            [[0.32, 0.34], [0.68, 0.34], [0.32, 0.68], [0.68, 0.68]].forEach(([fx, fy]) => {
              ctx.fillRect(vx + vw * fx - 18, vy + vh * fy - 18, 36, 36);
            });
          } else {
            // 负胶：四周未曝光胶被全部洗去露硅，仅4个透光窗交联保留成独立微柱 (Pillars)!
            ctx.fillStyle = resistColor;
            [[0.32, 0.34], [0.68, 0.34], [0.32, 0.68], [0.68, 0.68]].forEach(([fx, fy]) => {
              const sz = liftoffFail ? 14 : 36 + swell * 2;
              ctx.fillRect(vx + vw * fx - sz / 2, vy + vh * fy - sz / 2, sz, sz);
            });
          }
        } else {
          // 掩模：透明字母 IC，背景遮光
          if (isPos) {
            ctx.fillStyle = resistColor;
            ctx.fillRect(vx, vy, vw, vh);
            ctx.fillStyle = "#334155";
            ctx.font = "bold 74px sans-serif";
            ctx.fillText("IC", vx + vw / 2, vy + vh / 2 + 26);
          } else {
            ctx.fillStyle = resistColor;
            ctx.font = liftoffFail ? "italic 52px sans-serif" : `bold ${74 + Math.round(swell)}px sans-serif`;
            ctx.fillText("IC", vx + vw / 2, vy + vh / 2 + 26);
          }
        }

        // 绘制显微镜目镜测微标尺 (Ocular Micrometer Reticle)
        const rxLine = vx + (state.rulerPos / 100) * vw;
        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(vx + 8, vy + vh - 20);
        ctx.lineTo(vx + vw - 8, vy + vh - 20);
        for (let t = vx + 12; t < vx + vw - 8; t += 16) {
          ctx.moveTo(t, vy + vh - 26);
          ctx.lineTo(t, vy + vh - 14);
        }
        // 垂直十字测量准星
        ctx.moveTo(rxLine, vy + 6);
        ctx.lineTo(rxLine, vy + vh - 6);
        ctx.stroke();

        ctx.fillStyle = "#fde047";
        ctx.font = "10.5px monospace";
        ctx.fillText("1格 = 5.0 μm 标尺", vx + vw - 62, vy + vh - 28);
      };

      drawScope(28, "🔬 正性光刻胶显影图 (曝光区溶解露硅)", true);
      drawScope(48 + panelW, "🔬 负性光刻胶显影图 (曝光区交联保留)", false);

      // 底部：教学大纲实验成绩构成进度条 (20% + 20% + 40% + 15% + 5%)
      ctx.fillStyle = "rgba(15,23,42,0.9)";
      ICChem.ui.drawRoundRect(ctx, 28, 340, w - 56, 62, 8);
      ctx.fill();
      ctx.fillStyle = tone === "positive" ? "#34d399" : tone === "warning" ? "#fbbf24" : "#fb7185";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(negStatus, 44, 362);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11.5px sans-serif";
      ctx.fillText(
        `大纲单次实验考核核算：预习(20/20) + 现场操作(${opScore}/20) + 数据采集处理(${dataScore}/40) + 思考题(15/15) + 报告整体印象(5/5) = ${totalLabScore} 分`,
        44,
        386
      );
    }

    buildControls();
    draw();

    return {
      reset() {
        state = { pattern: "lines", negDose: 65, devTime: 50, rulerPos: 50 };
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });
})();
